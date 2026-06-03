const Order = require("../models/Order");
const Product = require("../models/Product");

const getSellerAnalytics = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const sellerOrders = await Order.find({ "items.seller": sellerId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    const sellerProducts = await Product.find({ seller: sellerId });

    let totalRevenue = 0;
    let totalOrders = sellerOrders.length;

    let pendingOrders = 0;
    let confirmedOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    const productSalesMap = {};
    const monthlySalesMap = {};

    sellerOrders.forEach((order) => {
      if (order.status === "pending") pendingOrders++;
      if (order.status === "confirmed") confirmedOrders++;
      if (order.status === "shipped") shippedOrders++;
      if (order.status === "delivered") deliveredOrders++;
      if (order.status === "cancelled") cancelledOrders++;

      const orderMonth = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!monthlySalesMap[orderMonth]) {
        monthlySalesMap[orderMonth] = 0;
      }

      order.items.forEach((item) => {
        if (item.seller.toString() !== sellerId) return;

        const productId = item.product?._id?.toString();
        const productName = item.product?.name || "Deleted Product";
        const quantity = item.quantity || 0;
        const revenue = quantity * item.price;

        if (order.paymentStatus === "paid") {
          totalRevenue += revenue;
          monthlySalesMap[orderMonth] += revenue;
        }

        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            productId,
            name: productName,
            quantitySold: 0,
            revenue: 0,
          };
        }

        productSalesMap[productId].quantitySold += quantity;
        productSalesMap[productId].revenue += revenue;
      });
    });

    const bestSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    const monthlySales = Object.entries(monthlySalesMap).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

    const lowStockProducts = sellerProducts
      .filter((product) => product.stock <= 5)
      .map((product) => ({
        productId: product._id,
        name: product.name,
        stock: product.stock,
        price: product.price,
      }));

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      bestSellingProducts,
      monthlySales,
      lowStockProducts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch seller analytics",
      error: error.message,
    });
  }
};

const getBuyerAnalytics = async (req, res) => {
  try {
    const { buyerId } = req.params;

    const orders = await Order.find({ buyer: buyerId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    let totalSpent = 0;
    let totalItems = 0;
    let pendingOrders = 0;
    let confirmedOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    const categoryMap = {};
    const monthlySpendMap = {};

    orders.forEach((order) => {
      if (order.status === "pending") pendingOrders++;
      if (order.status === "confirmed") confirmedOrders++;
      if (order.status === "shipped") shippedOrders++;
      if (order.status === "delivered") deliveredOrders++;
      if (order.status === "cancelled") cancelledOrders++;

      const orderMonth = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!monthlySpendMap[orderMonth]) {
        monthlySpendMap[orderMonth] = 0;
      }

      if (order.paymentStatus === "paid") {
        totalSpent += order.totalAmount || 0;
        monthlySpendMap[orderMonth] += order.totalAmount || 0;
      }

      order.items.forEach((item) => {
        totalItems += item.quantity || 0;

        const category = item.product?.category || "Other";

        if (!categoryMap[category]) {
          categoryMap[category] = {
            category,
            quantity: 0,
            amount: 0,
          };
        }

        categoryMap[category].quantity += item.quantity || 0;
        categoryMap[category].amount += (item.quantity || 0) * (item.price || 0);
      });
    });

    const monthlySpend = Object.entries(monthlySpendMap).map(
      ([month, amount]) => ({
        month,
        amount,
      }),
    );

    const favoriteCategories = Object.values(categoryMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 5).map((order) => ({
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      itemCount: order.items.length,
    }));

    return res.status(200).json({
      totalOrders: orders.length,
      totalSpent,
      totalItems,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      monthlySpend,
      favoriteCategories,
      recentOrders,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch buyer analytics",
      error: error.message,
    });
  }
};

module.exports = {
  getSellerAnalytics,
  getBuyerAnalytics,
};
