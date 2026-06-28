const admin = require("../firebaseAdmin");
const User = require("../models/User");

// Protect middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = await admin.auth().verifyIdToken(token);

      let user = await User.findOne({ email: decoded.email });

      if (!user) {
        user = await User.create({
          name: decoded.name,
          email: decoded.email,
          password: "firebase-auth"
        });
      }

      req.user = user;

      next();

    } catch (error) {
      return res.status(401).json({ message: "Invalid Firebase token" });
    }
  } else {
    return res.status(401).json({ message: "No token" });
  }
};

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Admin only access" });
  }
};

module.exports = { protect, adminOnly };