const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// GET all reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 }); 

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST submit a review 
router.post("/:productId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    const hasPurchased = await Order.findOne({
      user: userId,
      status: { $ne: "Cancelled" },
      "products.product": productId
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "You must purchase this product before reviewing"
      });
    }

    // check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({ productId, userId });

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }

    //  save review
    const review = await Review.create({
      productId,
      userId,
      userName: req.user.name,
      rating,
      comment
    });

    // recalculate average rating on Product
    const allReviews = await Review.find({ productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(avgRating * 10) / 10, 
      totalReviews: allReviews.length
    });

    res.status(201).json(review);

  } catch (err) {
    //  handle duplicate review 
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE a review 
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    //  only admin or the person who wrote it can delete
    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Review.findByIdAndDelete(req.params.id);

    //  recalculate average after delete
    const allReviews = await Review.find({ productId: review.productId });

    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    await Product.findByIdAndUpdate(review.productId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    res.json({ message: "Review deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;