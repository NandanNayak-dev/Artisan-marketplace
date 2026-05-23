import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const userRes = await axios.get("http://localhost:8000/api/auth/me", {
          withCredentials: true,
        });

        setUser(userRes.data.user);

        const productRes = await axios.get(
          `http://localhost:8000/api/products/${id}`,
        );

        setProduct(productRes.data.product);
      } catch (error) {
        console.log(error);
        alert("Failed to load product details");
        navigate("/buyer/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  if (loading) {
    return <p className="text-center mt-10">Loading product...</p>;
  }

  if (!product) {
    return <p className="text-center mt-10">Product not found</p>;
  }

  const handleAddToCart = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/cart/add",
        {
          buyer: user.id,
          product: product._id,
          quantity: 1,
        },
        {
          withCredentials: true,
        },
      );

      alert("Product added to cart");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to add product to cart");
    }
  };

  return (
    <div>
      <Navbar title="Product Details" user={user} />

      <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded shadow grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover rounded"
        />

        <div>
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

          <p className="text-gray-600 mt-4">{product.description}</p>

          <p className="text-2xl font-bold text-amber-700 mt-6">
            ₹{product.price}
          </p>

          <p className="mt-4 text-gray-700">Category: {product.category}</p>

          <p className="mt-2 text-gray-700">Stock: {product.stock}</p>

          <p className="mt-2 text-gray-700">
            Seller: {product.seller.fullName}
          </p>

          <div className="flex gap-4 mt-8">
            <button
              className="flex-1 bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
              onClick={() => alert("Cart feature coming next")}
            >
              Add to Cart
            </button>

            <button
              className="flex-1 border border-amber-700 text-amber-700 py-2 rounded hover:bg-amber-50"
              onClick={() => alert("Buy Now feature coming next")}
            >
              Buy Now
            </button>

            <button
              className="flex-1 bg-amber-700 text-white py-2 rounded hover:bg-amber-800"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button
              onClick={() => navigate("/cart")}
              className="bg-amber-700 text-white px-4 py-2 rounded"
            >
              My Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
