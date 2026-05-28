import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function SellerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
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
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });
        
        if (res.data.user.role !== "seller") {
          navigate("/signin");
          return;
        }
        setUser(res.data.user);

        const orderRes = await axios.get(
          `http://localhost:8000/api/orders/seller/${res.data.user.id}`,
          { withCredentials: true },
        );

        setOrders(orderRes.data.orders);
      } catch (error) {
        navigate("/signin");
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/products");
        setProducts(res.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
    fetchProducts();
  }, [navigate]);

  // Filter products once using useMemo for performance
  const myProducts = useMemo(() => {
    return products.filter((product) => product.seller?._id === user?.id);
  }, [products, user]);

  const totalStock = myProducts.reduce((acc, item) => acc + (item.stock || 0), 0);
  const activeOrders = orders.filter(
    (order) => !["cancelled", "delivered"].includes(order.status),
  ).length;
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length;
  const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((total, order) => total + (order.totalAmount || 0), 0);

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
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8000/api/products/${productId}`, {
        withCredentials: true,
      });

      setProducts(products.filter((product) => product._id !== productId));
      alert("Product deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf9f6_0%,#ffffff_45%,#f8f5ef_100%)]">
      <Navbar title="Seller Dashboard" user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        
        {/* Header */}
        <div className="mb-8 border-b border-stone-200 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-800/80">
                Marketplace
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Welcome back, {user?.fullName?.split(' ')[0]}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                Manage your handcrafted product listings, update availability, and keep your marketplace polished.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/seller/add-product")}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-700 to-orange-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-amber-800 hover:to-orange-900 hover:shadow-md"
              >
                + Add Product
              </button>

              <button
                onClick={() => navigate("/seller/orders")}
                className="inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition-all duration-200 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 hover:shadow-md"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.04)]">
             <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Total Products</p>
             <p className="mt-2 text-3xl font-bold text-stone-900">{myProducts.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.04)]">
             <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Total Stock</p>
             <p className="mt-2 text-3xl font-bold text-stone-900">{totalStock} <span className="text-sm font-medium text-stone-400">units</span></p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.04)]">
             <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Active Orders</p>
             <p className="mt-2 text-3xl font-bold text-stone-900">{activeOrders}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.04)]">
             <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Paid Orders</p>
             <p className="mt-2 text-3xl font-bold text-emerald-700">{paidOrders}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.04)]">
             <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">Revenue</p>
             <p className="mt-2 text-2xl font-bold text-amber-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-[0_4px_20px_rgba(28,25,23,0.04)]">
             <p className="text-xs font-semibold uppercase tracking-widest text-amber-800">Cancelled</p>
             <p className="mt-2 text-3xl font-bold text-amber-900">{cancelledOrders}</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">
            My Products
          </h2>

          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            {myProducts.length} listings
          </span>
        </div>

        {/* Empty State */}
        {loading ? (
            <div className="py-20 text-center text-stone-400">Loading products...</div>
        ) : myProducts.length === 0 ? (
          <div className="mx-auto mt-12 max-w-2xl rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center shadow-[0_10px_30px_rgba(28,25,23,0.06)]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7h-3.93l-1.74-3.48A2 2 0 0012.54 2h-1.08a2 2 0 00-1.79 1.12L7.93 7H4a2 2 0 00-2 2v1a1 1 0 001 1h18a1 1 0 001-1V9a2 2 0 00-2-2zM5 13v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-stone-900">No products listed yet</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">Start by adding your first handmade product and make it available to buyers.</p>
            <button 
                onClick={() => navigate("/seller/add-product")}
                className="mt-6 text-amber-700 font-semibold hover:underline"
            >
                List your first product &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {myProducts.map((product) => (
              <div
                key={product._id}
                className="group flex flex-col rounded-lg border border-stone-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden rounded-t-lg bg-stone-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-4 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute left-2 top-2 rounded-sm bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    HANDMADE
                  </div>

                  <div className="absolute right-2 top-2 flex gap-2">
                     <button
                        onClick={() => openEditModal(product)}
                        className="rounded-md bg-white/95 p-2 text-stone-600 shadow-sm transition-colors hover:bg-amber-50 hover:text-amber-700"
                        title="Edit Product"
                     >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 7.125 16.875 4.5M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                     </button>
                     <button 
                        onClick={() => handleDelete(product._id)}
                        className="rounded-md bg-white/95 p-2 text-stone-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Delete Product"
                     >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                     </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-grow flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold text-stone-900">
                        {product.name}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm font-medium text-stone-500">
                        {product.category}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="hidden">Price</p>
                      <p className="text-lg font-bold text-amber-900">₹{product.price}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3.5 w-3.5 ${i < 4 ? "text-amber-400" : "text-stone-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-stone-500">(120)</span>
                  </div>

                  <p className="hidden">
                    {product.description}
                  </p>

                  <div className="hidden">
                     <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Category</p>
                        <p className="mt-1 text-sm font-semibold text-stone-800 truncate">{product.category}</p>
                     </div>
                     <div className={`rounded-2xl border px-3 py-2 ${product.stock > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Stock</p>
                        <p className={`mt-1 text-sm font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{product.stock} units</p>
                     </div>
                  </div>
                  <div className={`mt-1 text-xs font-medium ${product.stock > 0 ? "text-green-700" : "text-red-600"}`}>
                    {product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
                  </div>
                  <div className="mt-auto pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 rounded-md border border-amber-600 bg-amber-50 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-600 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 rounded-md bg-amber-700 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-800"
                      >
                        Delete
                      </button>
                    </div>
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
                  Update listing details, stock, price, or image.
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
