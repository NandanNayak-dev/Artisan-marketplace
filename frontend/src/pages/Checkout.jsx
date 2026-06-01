import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:8000/api";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutData = location.state;

  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponId, setCouponId] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });

        setUser(res.data.user);
      } catch (error) {
        navigate("/signin");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    setCouponId(null);
    setDiscountAmount(0);
    setCouponMessage("");
  }, [quantity, checkoutData?.product?._id]);

  if (!checkoutData || !checkoutData.product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">
            No Product Selected
          </h2>
          <p className="text-stone-500 mb-6">
            Please select a product to proceed to checkout.
          </p>
          <button
            onClick={() => navigate("/buyer/dashboard")}
            className="bg-amber-700 text-white px-6 py-2 rounded-lg hover:bg-amber-800 transition-colors"
          >
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  const product = checkoutData.product;
  const totalAmount = product.price * quantity;
  const deliveryCharge = totalAmount > 400 ? 50 : 0;
  const finalAmount = totalAmount + deliveryCharge;
  const payableAmount = finalAmount - discountAmount;

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a discount token");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/coupons/validate`,
        {
          code: couponCode,
          totalAmount: finalAmount,
        },
        { withCredentials: true },
      );

      setCouponId(res.data.couponId);
      setDiscountAmount(res.data.discountAmount);
      setCouponMessage(res.data.message);
    } catch (error) {
      setCouponId(null);
      setDiscountAmount(0);
      setCouponMessage(error.response?.data?.message || "Failed to apply token");
    }
  };

  const getRewardMessage = (rewardCoupon) => {
    if (!rewardCoupon) {
      return "Order placed successfully";
    }

    return `Order placed successfully. You earned a 10% discount token: ${rewardCoupon.code}`;
  };

  const handlePlaceOrder = async () => {
    if (
      !address.fullName ||
      !address.phone ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      alert("Please fill all address fields");
      return;
    }

    if (!user) {
      alert("Please sign in to continue");
      navigate("/signin");
      return;
    }

    setIsPlacingOrder(true);

    try {
      if (paymentMethod === "Cash on Delivery") {
        const orderRes = await axios.post(
          `${API_URL}/orders/buy-now`,
          {
            buyer: user.id,
            productId: product._id,
            quantity,
            shippingAddress: address,
            paymentMethod,
            couponId,
          },
          { withCredentials: true },
        );

        alert(getRewardMessage(orderRes.data.rewardCoupon));
        navigate("/my-orders");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        alert("Razorpay failed to load. Please check your internet.");
        return;
      }

      const paymentOrderRes = await axios.post(
        `${API_URL}/payments/create-order`,
        {
          productId: product._id,
          quantity,
          buyer: user.id,
          couponId,
        },
        { withCredentials: true },
      );

      const { key, razorpayOrder } = paymentOrderRes.data;

      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Artisan Marketplace",
        description: product.name,
        order_id: razorpayOrder.id,

        prefill: {
          name: address.fullName,
          email: user.email,
          contact: address.phone,
        },

        theme: {
          color: "#b45309",
        },

        handler: async function (response) {
          const verifyRes = await axios.post(
            `${API_URL}/payments/verify`,
            {
              buyer: user.id,
              productId: product._id,
              quantity,
              shippingAddress: address,
              paymentMethod,
              couponId,

              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { withCredentials: true },
          );

          alert(getRewardMessage(verifyRes.data.rewardCoupon));
          navigate("/my-orders");
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        alert(response.error.description || "Payment failed");
      });

      razorpay.open();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Checkout" user={user} />

      {/* Checkout Header / Stepper */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 text-sm font-medium text-stone-500">
            <span className="flex items-center gap-2 text-amber-700">
              <span className="w-6 h-6 bg-amber-700 text-white rounded-full flex items-center justify-center text-xs">
                1
              </span>
              Shipping
            </span>
            <div className="h-px w-8 bg-stone-300"></div>
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 border border-stone-300 rounded-full flex items-center justify-center text-xs">
                2
              </span>
              Payment
            </span>
            <div className="h-px w-8 bg-stone-300"></div>
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 border border-stone-300 rounded-full flex items-center justify-center text-xs">
                3
              </span>
              Confirm
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address Section */}
          <section className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-stone-800">
                Delivery Address
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  placeholder="John Doe"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  className="w-full border border-stone-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={address.phone}
                  onChange={handleAddressChange}
                  className="w-full border border-stone-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Address (Street, Area, Colony)
                </label>
                <textarea
                  name="street"
                  placeholder="Flat No., Building Name, Street/Road"
                  value={address.street}
                  onChange={handleAddressChange}
                  rows={2}
                  className="w-full border border-stone-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  City
                </label>
                <input
                  name="city"
                  placeholder="e.g. Jaipur"
                  value={address.city}
                  onChange={handleAddressChange}
                  className="w-full border border-stone-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  State
                </label>
                <input
                  name="state"
                  placeholder="e.g. Rajasthan"
                  value={address.state}
                  onChange={handleAddressChange}
                  className="w-full border border-stone-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Pincode
                </label>
                <input
                  name="pincode"
                  placeholder="6 digit PIN"
                  value={address.pincode}
                  onChange={handleAddressChange}
                  className="w-full border border-stone-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center font-bold">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-stone-800">
                Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: "Cash on Delivery",
                  label: "Cash on Delivery",
                  icon: "💵",
                },
                { id: "UPI", label: "UPI / Google Pay / PhonePe", icon: "📱" },
                { id: "Card", label: "Credit / Debit Card", icon: "💳" },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "border-amber-600 bg-amber-50 ring-1 ring-amber-600"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-amber-700 border-gray-300 focus:ring-amber-600"
                    />
                    <span className="text-lg font-medium text-stone-800">
                      {method.label}
                    </span>
                  </div>
                  <span className="text-2xl">{method.icon}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary (Sticky) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm sticky top-36">
            <h2 className="text-xl font-bold text-stone-800 mb-4 pb-4 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Product Card */}
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-stone-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Seller: {product.seller?.fullName}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-base font-bold text-stone-900">
                    ₹{product.price}
                  </span>
                  {/* Quantity Control */}
                  <div className="flex items-center border border-stone-300 rounded">
                    <button
                      onClick={() =>
                        setQuantity(quantity > 1 ? quantity - 1 : 1)
                      }
                      className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                    >
                      -
                    </button>
                    <span className="px-2 py-0.5 text-xs font-bold border-x border-stone-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-0.5 text-stone-600 hover:bg-stone-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 text-sm text-stone-600 border-t border-b border-stone-100 py-4 mb-4">
              <div className="flex justify-between">
                <span>
                  Price ({quantity} item{quantity > 1 && "s"})
                </span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span
                  className={
                    deliveryCharge === 0 ? "text-green-600 font-medium" : ""
                  }
                >
                  {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                </span>
              </div>
              {deliveryCharge === 0 ? (
                <p className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  No delivery charge for orders up to ₹400.
                </p>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  ₹50 delivery charge applies for orders above ₹400.
                </p>
              )}
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-amber-900 mb-2">
                  Discount Token
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="SAVE10-XXXXXX"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="min-w-0 flex-1 rounded-md border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-700"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-md bg-amber-800 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-900"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="mt-2 text-xs text-amber-900">{couponMessage}</p>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-medium">
                  <span>Token Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-stone-900 mb-6">
              <span>Total Amount</span>
              <span>₹{payableAmount}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-amber-700 text-white py-3.5 rounded-lg font-bold text-lg shadow-lg shadow-amber-700/30 hover:bg-amber-800 hover:shadow-xl transition-all transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPlacingOrder
                ? "Processing..."
                : paymentMethod === "Cash on Delivery"
                  ? "Place Order"
                  : "Pay ₹" + payableAmount}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Safe and Secure Payments. 100% Buyer Protection.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
