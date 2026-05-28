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
  const [behindTheScenesVideo, setBehindTheScenesVideo] = useState(null);

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

  const handleVideoChange = (e) => {
    setBehindTheScenesVideo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select a product image");
      return;
    }

    if (!behindTheScenesVideo) {
      alert("Please select a behind the scenes video");
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
      data.append("behindTheScenesVideo", behindTheScenesVideo);

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
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf9f6_0%,#ffffff_45%,#f8f5ef_100%)]">
      <Navbar title="Add Product" user={user} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 border-b border-stone-200 pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-800/80">
            Artisan Marketplace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Add New Product
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
            Create a polished listing for your handmade product with clear details, pricing, and imagery.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left info panel */}
          <aside className="lg:col-span-2">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-stone-200 bg-[linear-gradient(180deg,#2d1f16_0%,#4a2f1f_100%)] shadow-[0_10px_30px_rgba(28,25,23,0.08)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />
              <div className="relative z-10 p-6 sm:p-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/80">
                  Listing Tips
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Present your craft beautifully
                </h2>
                <p className="mt-4 text-sm leading-6 text-stone-300">
                  A strong product listing helps buyers trust your work, understand the value, and complete purchases faster.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <p className="text-sm font-semibold text-amber-100">
                      Clear product title
                    </p>
                    <p className="mt-1 text-sm leading-6 text-stone-300">
                      Use a simple, descriptive name that tells buyers exactly what the item is.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <p className="text-sm font-semibold text-amber-100">
                      Good image and video
                    </p>
                    <p className="mt-1 text-sm leading-6 text-stone-300">
                      Upload a bright image and a short making video so buyers can see the effort behind the price.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <p className="text-sm font-semibold text-amber-100">
                      Honest description
                    </p>
                    <p className="mt-1 text-sm leading-6 text-stone-300">
                      Mention material, use case, and any special craftsmanship details buyers should know.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Form card */}
          <section className="lg:col-span-3">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_10px_30px_rgba(28,25,23,0.06)] sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-stone-900">
                    Product Details
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Fill in the details below to publish your listing.
                  </p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Seller Form
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Product Name
                  </label>
                  <input
                    name="name"
                    placeholder="e.g. Handwoven Cotton Bag"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-700/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe the product, material, craftsmanship, and what makes it special..."
                    value={formData.description}
                    onChange={handleChange}
                    className="min-h-32 w-full resize-none rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-700/10"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Price
                    </label>
                    <input
                      name="price"
                      type="number"
                      placeholder="e.g. 799"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-700/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-700">
                      Stock Quantity
                    </label>
                    <input
                      name="stock"
                      type="number"
                      placeholder="e.g. 25"
                      value={formData.stock}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-700/10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Category
                  </label>
                  <input
                    name="category"
                    placeholder="e.g. Home Decor, Jewelry, Pottery"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-amber-700 focus:bg-white focus:ring-4 focus:ring-amber-700/10"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Product Image
                  </label>
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 transition-all hover:border-amber-300 hover:bg-amber-50/40">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-amber-800"
                      required
                    />
                    <p className="mt-3 text-xs leading-5 text-stone-500">
                      Upload a clear JPG, PNG, or WebP image that showcases your product well.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-700">
                    Behind the Scenes Video
                  </label>
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 transition-all hover:border-amber-300 hover:bg-amber-50/40">
                    <input
                      type="file"
                      name="behindTheScenesVideo"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="block w-full text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-amber-800"
                      required
                    />
                    <p className="mt-3 text-xs leading-5 text-stone-500">
                      Upload a short video showing how the product was made. This helps buyers understand the craftsmanship and value.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-700 to-orange-800 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-amber-800 hover:to-orange-900 hover:shadow-md"
                >
                  Add Product
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AddProduct;
