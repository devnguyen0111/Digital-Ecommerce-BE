const express = require("express");
const router = express.Router();
const walletController = require("../../controllers/user/walletController");
const { protect, authorize } = require("../../middleware/auth");
const { addFundsValidation, validate } = require("../../middleware/validators");

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

router.post("/payos-webhook", walletController.payosWebhook);

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
