const express = require("express");
const router = express.Router();
const authController = require("../../controllers/user/authController");
const { protect } = require("../../middleware/auth");
const {
  registerValidation,
  loginValidation,
  validate,
} = require("../../middleware/validators");

// User registration
router.post("/register", registerValidation, validate, authController.register);

// User login
router.post("/login", loginValidation, validate, authController.login);

// Email verification
router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

// Refresh token
router.post("/refresh-token", authController.refreshToken);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password/:resetToken", authController.resetPassword);

// Get current user info
router.get("/me", protect, authController.getCurrentUser);

// User logout
router.post("/logout", protect, authController.logout);

module.exports = router;
