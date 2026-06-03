import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function SellerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  useEffect(() => {
    const loadSellerDashboard = async () => {
      try {
        const authRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        const loggedInUser = authRes.data.user;

        if (loggedInUser.role !== "seller") {
          navigate("/signin");
          return;
        }

        setUser(loggedInUser);

        const productsRes = await axios.get("http://localhost:8000/api/products");

        setProducts(productsRes.data.products || []);
      } catch (error) {
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    loadSellerDashboard();
  }, [navigate]);

  const myProducts = useMemo(() => {
    return products.filter((product) => product.seller?._id === user?.id);
  }, [products, user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditImage(null);
    setEditForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      stock: product.stock || "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("description", editForm.description);
      formData.append("price", editForm.price);
      formData.append("category", editForm.category);
      formData.append("stock", editForm.stock);

      if (editImage) {
        formData.append("image", editImage);
      }

      const res = await axios.put(
        `http://localhost:8000/api/products/${editingProduct._id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product._id === editingProduct._id ? res.data.product : product,
        ),
      );

      setEditingProduct(null);
      alert("Product updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update product");
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/products/${productId}`, {
        withCredentials: true,
      });

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== productId),
      );

      alert("Product deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf9f6_0%,#ffffff_45%,#f8f5ef_100%)]">
      <Navbar title="Seller Dashboard" user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 border-b border-stone-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-800/80">
                Marketplace
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Welcome back, {user?.fullName?.split(" ")[0]}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                Track sales, manage products, and monitor your handmade store
                performance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/seller/add-product")}
                className="rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
              >
                + Add Product
              </button>

              <button
                onClick={() => navigate("/seller/orders")}
                className="rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-amber-50"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-900">My Products</h2>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            {myProducts.length} listings
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-stone-400">
            Loading dashboard...
          </div>
        ) : myProducts.length === 0 ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">
              No products listed yet
            </h2>
            <p className="mt-3 text-sm text-stone-600">
              Start by adding your first handmade product.
            </p>
            <button
              onClick={() => navigate("/seller/add-product")}
              className="mt-6 font-semibold text-amber-700 hover:underline"
            >
              List your first product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {myProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col rounded-lg border border-stone-200 bg-white shadow-sm hover:shadow-lg"
              >
                <div className="relative h-56 overflow-hidden rounded-t-lg bg-stone-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-4"
                  />

                  <div className="absolute left-2 top-2 rounded-sm bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    HANDMADE
                  </div>
                </div>

                <div className="flex flex-grow flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="line-clamp-2 text-base font-bold text-stone-900">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        {product.category}
                      </p>
                    </div>

                    <p className="text-lg font-bold text-amber-900">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <p
                    className={`mt-2 text-xs font-medium ${
                      product.stock > 5
                        ? "text-green-700"
                        : product.stock > 0
                          ? "text-amber-700"
                          : "text-red-600"
                    }`}
                  >
                    {product.stock > 0
                      ? `${product.stock} units in stock`
                      : "Out of stock"}
                  </p>

                  <div className="mt-auto flex gap-2 pt-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 rounded-md border border-amber-600 bg-amber-50 py-2 text-sm font-bold text-amber-700 hover:bg-amber-600 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 rounded-md bg-amber-700 py-2 text-sm font-bold text-white hover:bg-amber-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <form
            onSubmit={handleUpdateProduct}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  Edit Product
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  Update product details, price, stock, or image.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-full bg-stone-100 px-3 py-1 text-sm font-bold text-stone-600 hover:bg-stone-200"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                placeholder="Product name"
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                required
              />

              <input
                name="category"
                value={editForm.category}
                onChange={handleEditChange}
                placeholder="Category"
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                required
              />

              <input
                name="price"
                type="number"
                value={editForm.price}
                onChange={handleEditChange}
                placeholder="Price"
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                required
              />

              <input
                name="stock"
                type="number"
                value={editForm.stock}
                onChange={handleEditChange}
                placeholder="Stock"
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-600"
                required
              />

              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                placeholder="Description"
                rows={4}
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-amber-600 sm:col-span-2"
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm sm:col-span-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg border border-stone-300 px-5 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-amber-700 px-5 py-2 text-sm font-bold text-white hover:bg-amber-800"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
