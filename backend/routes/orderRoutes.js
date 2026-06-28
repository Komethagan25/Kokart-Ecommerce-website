const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");

router.post("/", protect, async (req, res) => {
  try {
    const { products, totalAmount, paymentId, address } = req.body;

    const newOrder = new Order({
      user: req.user._id,
      products,
      totalAmount,
      paymentId,
      address
    });

    const savedOrder = await newOrder.save();
    await Cart.deleteMany({ userId: req.user._id });
    res.status(201).json(savedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get My Orders
router.get("/", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product", "name images price")
      .sort({ createdAt: -1 }); 

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Get ALL Orders 
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")       
      .populate("products.product", "name images price")
      .sort({ createdAt: -1 }); 

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  Update Order Status 
router.put("/status/:id", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    //  update the status
    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel Order 
router.put("/cancel/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Already cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;