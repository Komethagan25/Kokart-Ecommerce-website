const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const { protect } = require("../middleware/authMiddleware");

// GET my wishlist
router.get("/", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userId: req.user._id })
      .populate("productId", "name images price averageRating totalReviews");

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//  ADD to wishlist
router.post("/:productId", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.create({
      userId: req.user._id,
      productId: req.params.productId
    });

    res.status(201).json(wishlist);
  } catch (err) {
    //  if already wishlisted  just return ok
    if (err.code === 11000) {
      return res.status(400).json({ message: "Already in wishlist" });
    }
    res.status(500).json({ message: err.message });
  }
});

//  REMOVE from wishlist
router.delete("/:productId", protect, async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({
      userId: req.user._id,
      productId: req.params.productId
    });

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;