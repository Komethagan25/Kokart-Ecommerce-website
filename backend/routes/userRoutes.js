const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const { protect } = require("../middleware/authMiddleware");

// GET current user
router.get("/me", protect, async (req, res) => {
  res.json(req.user);
});

router.post("/save", protect, async (req, res) => {
  const { name, email } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      password: "firebase-auth"
    });
  } else {
    user.name = name; 
    await user.save();
  }

  res.json(user);
});

module.exports = router;