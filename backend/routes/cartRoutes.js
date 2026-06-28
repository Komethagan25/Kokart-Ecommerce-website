const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Add to cart 
router.post("/add", protect, async (req, res) => {
  try {
    const { productId } = req.body;

    const existingItem = await Cart.findOne({
      userId: req.user._id,
      productId,
    });

    if (existingItem) {
      existingItem.quantity += 1;
      await existingItem.save();
      return res.json({ message: "Quantity Updated" });
    }

    const cartItem = new Cart({
      userId: req.user._id,
      productId,
      quantity: 1,
    });

    await cartItem.save();

    res.json({ message: "Added to Cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cart items 
router.get("/", protect, async (req, res) => {
  const items = await Cart.find({ userId: req.user._id })
    .populate("productId");

  res.json(items);
});


// Increase quantity
router.put("/increase/:id", protect, async (req, res) => {
  const item = await Cart.findById(req.params.id);
  item.quantity += 1;
  await item.save();
  res.json(item);
});

// Decrease quantity
router.put("/decrease/:id", protect, async (req, res) => {
  const item = await Cart.findById(req.params.id);

  if (item.quantity > 1) {
    item.quantity -= 1;
    await item.save();
  } else {
    await item.deleteOne();
  }

  res.json({ message: "Updated" });
});

// Remove item
router.delete("/remove/:id", protect, async (req, res) => {
  await Cart.findByIdAndDelete(req.params.id);
  res.json({ message: "Item removed" });
});

module.exports = router;