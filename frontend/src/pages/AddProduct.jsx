import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function AddProduct() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [image, setImage] = useState(null);

  useEffect(() => {
    const checkSeller = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        if (res.data.user.role !== "seller") {
          navigate("/signin");
          return;
        }

        setUser(res.data.user);
      } catch (error) {
        navigate("/signin");
      }
    };

    checkSeller();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!image) {
    alert("Please select a product image");
    return;
  }

  try {
    const data = new FormData();

    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", Number(formData.price));
    data.append("category", formData.category);
    data.append("stock", Number(formData.stock));
    data.append("seller", user.id);
    data.append("image", image);

    await axios.post("http://localhost:8000/api/products", data, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Product added successfully");
    navigate("/seller/dashboard");
  } catch (error) {
    console.log(error);
    alert(error.response?.data?.message || "Failed to add product");
  }
};

  return (
    <div>
      <Navbar title="Add Product" user={user} />

      <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-amber-700">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Product name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <textarea
            name="description"
            placeholder="Product description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <input
            name="price"
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock quantity"
            value={formData.stock}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border px-4 py-2 rounded"
            required
          />

          <button
            type="submit"
            className="w-full bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
          >
            Add Product
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
