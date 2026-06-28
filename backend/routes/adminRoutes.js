const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/stats", protect, adminOnly, async (req, res) => {
  try {

    // count total orders
    const totalOrders = await Order.countDocuments();

    //  count total users
    const totalUsers = await User.countDocuments();

    //  count total products
    const totalProducts = await Product.countDocuments();

    // calculate total revenue
    const revenueResult = await Order.aggregate([
      {
        // only count non-cancelled orders
        $match: { status: { $ne: "Cancelled" } }
      },
      {
        // add up all totalAmount fields
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

  
    const totalRevenue = revenueResult[0]?.total || 0;

    //  get last 5 orders for recent orders table
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    //  get revenue for last 7 days for the bar chart
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      // calculate start and end of each day
      const date = new Date();
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // find all orders placed on this day
      const dayOrders = await Order.find({
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: { $ne: "Cancelled" }
      });

      // add up revenue for this day
      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

      const dateLabel = date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short"
      });

      last7Days.push({
        date: dateLabel,
        revenue: dayRevenue
      });
    }

    //  send everything in one response
    res.json({
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      recentOrders,
      revenueByDay: last7Days
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;