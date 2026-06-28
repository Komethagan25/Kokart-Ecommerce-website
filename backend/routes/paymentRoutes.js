const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const { protect } = require("../middleware/authMiddleware");



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Order
router.post("/create-order", protect, async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const { amount } = req.body;


    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.log("RAZORPAY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;