const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { RATE_LIMIT } = require("../../config/constants");

const walletController = require("../../controllers/user/walletController");
const { protect, authorize } = require("../../middleware/auth");
const { addFundsValidation, validate } = require("../../middleware/validators");

// Webhook-specific rate limiter
const webhookLimiter = rateLimit({
  windowMs: RATE_LIMIT.WEBHOOK_WINDOW_MS,
  max: RATE_LIMIT.WEBHOOK_MAX,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      code: '99',
      desc: 'Too many webhook requests, please try again later',
      success: false
    });
  }
});

router.get("/", protect, walletController.getWallet);

router.get("/balance", protect, walletController.getBalance);

router.get("/transactions", protect, walletController.getTransactions);

router.post(
  "/add-funds",
  protect,
  addFundsValidation,
  validate,
  walletController.addFunds,
);

// Apply rate limiting to webhook endpoint
router.post("/payos-webhook", webhookLimiter, walletController.payosWebhook);

router.get(
  "/payment-status/:orderCode",
  protect,
  walletController.checkPaymentStatus,
);

router.post(
  "/cancel-payment/:orderCode",
  protect,
  walletController.cancelPayment,
);
router.post(
  "/sync-payment/:paymentId",
  protect,
  walletController.syncPaymentToWallet,
);
router.post(
  "/credit",
  protect,
  authorize("admin", "manager"),
  walletController.creditWallet,
);

router.post("/transfer", protect, walletController.transferFunds);

module.exports = router;
