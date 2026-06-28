const express = require("express");
const router = express.Router();
const Address = require("../models/Address");
const { protect } = require("../middleware/authMiddleware");

// GET all addresses of logged in user
router.get("/", protect, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST save new address
router.post("/", protect, async (req, res) => {
  try {
    const { name, phone, street, city, state, pincode } = req.body;

    const address = await Address.create({
      userId: req.user._id,
      name,
      phone,
      street,
      city,
      state,
      pincode
    });

    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE address
router.delete("/:id", protect, async (req, res) => {
  try {
    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;