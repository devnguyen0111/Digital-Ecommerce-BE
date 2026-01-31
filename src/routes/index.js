const express = require("express");
const router = express.Router();

// import all routes modules
const authRoutes = require("./user/authRoutes");
const userRoutes = require("./user/userRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

// API info route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DN-Ecommerce API",
    version: "0.0.1",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
    },
  });
});

module.exports = router;
