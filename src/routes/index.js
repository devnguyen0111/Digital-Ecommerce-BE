const express = require("express");
const router = express.Router();
const packageJson = require("../../package.json");

// import all routes modules
const authRoutes = require("./user/authRoutes");
const userRoutes = require("./user/userRoutes");
const walletRoutes = require("./user/walletRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/wallet", walletRoutes);

// API info route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DN-Ecommerce API",
    version: packageJson.version,
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      wallet: "/api/wallet",
    },
  });
});

module.exports = router;
