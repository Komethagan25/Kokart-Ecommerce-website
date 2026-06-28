const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH suggestions
router.get("/suggest/:keyword", async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const products = await Product.find({
      name: { $regex: keyword, $options: "i" }
    }).limit(5);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//  GET products
router.get("/category/:name", async (req, res) => {
  try {
    const categoryName = req.params.name;

    const products = await Product.find({
      
      category: { $regex: `^${categoryName}$`, $options: "i" }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD product 
router.post("/", protect, adminOnly, upload.array("images", 5), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const imageUrls = req.files.map((file) => file.path);

    const product = new Product({
      name,
      price,
      description,
      category, 
      images: imageUrls
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE product
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE product
router.put("/:id", protect, adminOnly, upload.array("images", 5), async (req, res) => {
  try {
    const { name, price, description, category } = req.body; 
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category; 

    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => file.path);
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;