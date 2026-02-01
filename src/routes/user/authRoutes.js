const express = require("express");
const router = express.Router();
const authController = require("../../controllers/user/authController");
const { protect } = require("../../middleware/auth");
const {
  registerValidation,
  loginValidation,
  validate,
} = require("../../middleware/validators");

router.post("/register", registerValidation, validate, authController.register);

router.post("/login", loginValidation, validate, authController.login);

router.get("/verify-email/:token", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

router.post("/refresh-token", authController.refreshToken);

router.post("/forgot-password", authController.forgotPassword);

router.post("/reset-password/:resetToken", authController.resetPassword);

router.get("/me", protect, authController.getCurrentUser);

router.post("/logout", protect, authController.logout);

module.exports = router;
