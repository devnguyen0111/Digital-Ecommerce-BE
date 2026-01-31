const express = require("express");
const router = express.Router();

// API info route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DN-Ecommerce API",
    version: "0.0.1",
    endpoints: {},
  });
});

module.exports = router;
