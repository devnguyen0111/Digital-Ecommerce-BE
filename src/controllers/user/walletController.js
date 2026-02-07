const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/apiResponse");
const walletService = require("../../services/walletService");
const paymentService = require("../../services/paymentService");
const Payment = require("../../models/Payment");
const emailService = require("../../services/emailService");
const WalletTransaction = require("../../models/WalletTransaction");

/**
 * @desc    Get wallet balance and details
 * @route   GET /api/wallet
 * @access  Private
 */
exports.getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user._id);

  res.json(ApiResponse.success("Wallet retrieved successfully", { wallet }));
});

/**
 * @desc    Get wallet transaction history
 * @route   GET /api/wallet/transactions
 * @access  Private
 */
exports.getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const { transactions, total } = await walletService.getTransactionHistory(
    req.user._id,
    page,
    limit,
  );

  res.json(
    ApiResponse.paginated(
      transactions,
      page,
      limit,
      total,
      "Transactions retrieved successfully",
    ),
  );
});

/**
 * @desc    Add funds to wallet via PayOS
 * @route   POST /api/wallet/add-funds
 * @access  Private
 */
exports.addFunds = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 1000) {
    return res
      .status(400)
      .json(ApiResponse.error("Amount must be at least 1,000 VND", 400));
  }

  // Create payment record for wallet top-up
  const payment = await Payment.create({
    user: req.user._id,
    amount,
    method: "payos",
    description: "Wallet top-up",
    status: "pending",
  });

  try {
    // Create PayOS payment link
    const paymentLink = await paymentService.createPaymentLink({
      orderId: payment._id.toString(),
      amount,
      description: `Nạp ${amount.toLocaleString()} VND vào ví`,
      buyerName: req.user.username,
      buyerEmail: req.user.email,
      buyerPhone: req.user.phone || "",
    });

    // Update payment with PayOS details
    payment.payosOrderId = paymentLink.orderCode.toString();
    payment.payosPaymentLinkId = paymentLink.paymentLinkId;
    payment.paymentUrl = paymentLink.checkoutUrl;
    payment.updateStatus(
      "processing",
      "Payment link created for wallet top-up",
    );
    await payment.save();

    res.status(201).json(
      ApiResponse.success("Payment link created successfully", {
        payment: {
          id: payment._id,
          amount: payment.amount,
          checkoutUrl: paymentLink.checkoutUrl,
          qrCode: paymentLink.qrCode,
          orderCode: paymentLink.orderCode,
          expiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      }),
    );
  } catch (error) {
    payment.updateStatus("failed", error.message);
    payment.failureReason = error.message;
    await payment.save();

    return res
      .status(500)
      .json(
        ApiResponse.error(
          error.message || "Failed to create payment link",
          500,
        ),
      );
  }
});

/**
 * @desc    PayOS webhook handler
 * @route   POST /api/wallet/payos-webhook
 * @access  Public (but verified)
 */
exports.payosWebhook = asyncHandler(async (req, res) => {
  try {
    // Process webhook data
    const webhookData = paymentService.processWebhook(req.body);

    // Find payment by orderCode
    const payment = await Payment.findOne({
      payosOrderId: webhookData.orderCode.toString(),
    });

    if (!payment) {
      console.error(
        "❌ Payment not found for orderCode:",
        webhookData.orderCode,
      );
      return res.status(404).json({ error: "Payment not found" });
    }



    // Check if already processed
    if (payment.status === "success") {
      return res.json({
        code: "00",
        desc: "Webhook already processed",
        success: true,
      });
    }

    // Handle different payment statuses
    if (webhookData.status === "PAID") {
      // Update payment status
      payment.updateStatus("success", "Payment completed via PayOS");
      payment.payosTransactionId =
        webhookData.transactions?.[0]?.reference || webhookData.orderCode;
      await payment.save();

      // Credit wallet only if not already credited
      const wallet = await walletService.getWallet(payment.user);
      const existingTransaction = await WalletTransaction.findOne({
        wallet: wallet._id,
        "reference.model": "Payment",
        "reference.id": payment._id,
      });

      if (existingTransaction) {
        // Already credited, skip
      } else {
        try {
          const { wallet: updatedWallet } = await walletService.creditWallet(
            payment.user,
            payment.amount,
            "Wallet top-up via PayOS",
            {
              model: "Payment",
              id: payment._id,
            },
          );

          // Send email notification
          const User = require("../../models/User");
          const user = await User.findById(payment.user);
          if (user) {
            emailService
              .sendWalletCreditEmail(
                user,
                payment.amount,
                updatedWallet.balance,
              )
              .catch((err) =>
                console.error("Failed to send wallet credit email:", err),
              );
          }
        } catch (error) {
          console.error("❌ Failed to credit wallet:", error);
          payment.updateStatus(
            "failed",
            `Webhook received but wallet credit failed: ${error.message}`,
          );
          payment.failureReason = error.message;
          await payment.save();
        }
      }
    } else if (webhookData.status === "CANCELLED") {
      payment.updateStatus("cancelled", "Payment cancelled by user or expired");
      payment.failureReason = webhookData.message || "Payment cancelled";
      await payment.save();
    } else if (webhookData.status === "EXPIRED") {
      payment.updateStatus("failed", "Payment link expired");
      payment.failureReason = "Payment link expired";
      await payment.save();
    }

    // Return success response to PayOS
    res.json({
      code: "00",
      desc: "success",
      success: true,
    });
  } catch (error) {
    console.error("❌ PayOS webhook error:", error);
    console.error("Stack:", error.stack);
    res.status(400).json({
      code: "99",
      desc: error.message,
      success: false,
    });
  }
});

/**
 * @desc    Check payment status
 * @route   GET /api/wallet/payment-status/:orderCode
 * @access  Private
 */
exports.checkPaymentStatus = asyncHandler(async (req, res) => {
  const { orderCode } = req.params;

  // Find payment
  const payment = await Payment.findOne({
    payosOrderId: orderCode,
    user: req.user._id,
  });

  if (!payment) {
    return res.status(404).json(ApiResponse.error("Payment not found", 404));
  }

  // IMPORTANT: Check if wallet already credited FIRST to prevent double credit on retries
  const wallet = await walletService.getWallet(req.user._id);
  const existingTransaction = await WalletTransaction.findOne({
    wallet: wallet._id,
    "reference.model": "Payment",
    "reference.id": payment._id,
  });

  // Get status from PayOS
  try {
    const paymentStatus = await paymentService.getPaymentStatus(orderCode);

    // Update payment if status changed
    if (paymentStatus.status === "PAID" && payment.status !== "success") {
      payment.updateStatus("success", "Payment verified as completed");
      payment.payosTransactionId =
        paymentStatus.transactions?.[0]?.reference || orderCode;
      await payment.save();

      // Credit wallet ONLY if not already done
      if (!existingTransaction) {
        const { wallet: updatedWallet } = await walletService.creditWallet(
          payment.user,
          payment.amount,
          "Wallet top-up via PayOS",
          {
            model: "Payment",
            id: payment._id,
          },
        );

        // Send email notification
        const User = require("../../models/User");
        const user = await User.findById(payment.user);
        if (user) {
          emailService
            .sendWalletCreditEmail(user, payment.amount, updatedWallet.balance)
            .catch((err) =>
              console.error("Failed to send wallet credit email:", err),
            );
        }
      }
    }

    // Return success response - EARLY RETURN to prevent fallback execution
    return res.json(
      ApiResponse.success("Payment status retrieved", {
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          payosStatus: paymentStatus.status,
          createdAt: payment.createdAt,
          paidAt: payment.completedAt || paymentStatus.paidAt,
        },
      }),
    );
  } catch (error) {
    console.error("Error getting payment status from PayOS:", error);

    // Fallback: If can't connect to PayOS but payment is marked success locally,
    // check if wallet needs to be credited
    if (payment.status === "success") {
      const wallet = await walletService.getWallet(req.user._id);
      const existingTransaction = await WalletTransaction.findOne({
        wallet: wallet._id,
        "reference.model": "Payment",
        "reference.id": payment._id,
      });

      if (!existingTransaction) {
        await walletService.creditWallet(
          payment.user,
          payment.amount,
          "Wallet top-up via PayOS (fallback)",
          {
            model: "Payment",
            id: payment._id,
          },
        );

        // Send email notification
        const User = require("../../models/User");
        const user = await User.findById(payment.user);
        if (user) {
          const updatedWallet = await walletService.getWallet(req.user._id);
          emailService
            .sendWalletCreditEmail(user, payment.amount, updatedWallet.balance)
            .catch((err) =>
              console.error("Failed to send wallet credit email:", err),
            );
        }
      }
    }

    // Return local payment status when PayOS API fails
    return res.json(
      ApiResponse.success("Payment status retrieved (local)", {
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
        },
      }),
    );
  }
});

/**
 * @desc    Cancel payment
 * @route   POST /api/wallet/cancel-payment/:orderCode
 * @access  Private
 */
exports.cancelPayment = asyncHandler(async (req, res) => {
  const { orderCode } = req.params;

  // Find payment
  const payment = await Payment.findOne({
    payosOrderId: orderCode,
    user: req.user._id,
  });

  if (!payment) {
    return res.status(404).json(ApiResponse.error("Payment not found", 404));
  }

  if (payment.status === "success") {
    return res
      .status(400)
      .json(ApiResponse.error("Cannot cancel completed payment", 400));
  }

  if (payment.status === "cancelled") {
    return res
      .status(400)
      .json(ApiResponse.error("Payment already cancelled", 400));
  }

  try {
    // Cancel on PayOS
    await paymentService.cancelPayment(orderCode, "Cancelled by user");

    // Update local payment
    payment.updateStatus("cancelled", "Cancelled by user");
    await payment.save();

    res.json(ApiResponse.success("Payment cancelled successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(
        ApiResponse.error(error.message || "Failed to cancel payment", 500),
      );
  }
});

/**
 * @desc    Manual credit to wallet (Admin only)
 * @route   POST /api/wallet/credit
 * @access  Private/Admin
 */
exports.creditWallet = asyncHandler(async (req, res) => {
  const { userId, amount, description } = req.body;

  if (!userId || !amount || !description) {
    return res
      .status(400)
      .json(
        ApiResponse.error("User ID, amount, and description are required", 400),
      );
  }

  const { wallet, transaction } = await walletService.creditWallet(
    userId,
    amount,
    description,
  );

  res.json(
    ApiResponse.success("Wallet credited successfully", {
      wallet,
      transaction,
    }),
  );
});

/**
 * @desc    Manual sync payment to wallet (for debugging/fixing issues)
 * @route   POST /api/wallet/sync-payment/:paymentId
 * @access  Private
 */
exports.syncPaymentToWallet = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  // Find payment
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    return res.status(404).json(ApiResponse.error("Payment not found", 404));
  }

  // Check if user owns this payment or is admin
  if (
    payment.user.toString() !== req.user._id.toString() &&
    !["admin", "manager"].includes(req.user.role)
  ) {
    return res.status(403).json(ApiResponse.error("Not authorized", 403));
  }

  // Check if payment is successful
  if (payment.status !== "success") {
    return res
      .status(400)
      .json(
        ApiResponse.error(
          `Cannot sync payment with status: ${payment.status}`,
          400,
        ),
      );
  }

  // Check if wallet already credited
  const wallet = await walletService.getWallet(payment.user);
  const existingTransaction = await WalletTransaction.findOne({
    wallet: wallet._id,
    "reference.model": "Payment",
    "reference.id": payment._id,
  });

  if (existingTransaction) {
    return res
      .status(400)
      .json(ApiResponse.error("Payment already synced to wallet", 400));
  }

  // Credit wallet
  const { wallet: updatedWallet, transaction } =
    await walletService.creditWallet(
      payment.user,
      payment.amount,
      "Manual sync: Wallet top-up via PayOS",
      {
        model: "Payment",
        id: payment._id,
      },
    );

  // Send email notification
  const User = require("../../models/User");
  const user = await User.findById(payment.user);
  if (user) {
    emailService
      .sendWalletCreditEmail(user, payment.amount, updatedWallet.balance)
      .catch((err) =>
        console.error("Failed to send wallet credit email:", err),
      );
  }

  console.log(`✅ Manual sync completed for payment ${payment._id}`);

  res.json(
    ApiResponse.success("Payment synced to wallet successfully", {
      wallet: updatedWallet,
      transaction,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
      },
    }),
  );
});

/**
 * @desc    Check wallet balance
 * @route   GET /api/wallet/balance
 * @access  Private
 */
exports.getBalance = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user._id);

  res.json(
    ApiResponse.success("Balance retrieved successfully", {
      balance: wallet.balance,
      currency: wallet.currency,
    }),
  );
});


/**
 * @desc    Transfer funds between wallets (Optional feature)
 * @route   POST /api/wallet/transfer
 * @access  Private
 */
exports.transferFunds = asyncHandler(async (req, res) => {
  const { recipientEmail, amount, note } = req.body;

  if (!recipientEmail || !amount) {
    return res
      .status(400)
      .json(ApiResponse.error("Recipient email and amount are required", 400));
  }

  if (amount < 1000) {
    return res
      .status(400)
      .json(
        ApiResponse.error("Transfer amount must be at least 1,000 VND", 400),
      );
  }

  // Find recipient user
  const User = require("../../models/User");
  const recipient = await User.findOne({ email: recipientEmail });

  if (!recipient) {
    return res.status(404).json(ApiResponse.error("Recipient not found", 404));
  }

  if (recipient._id.toString() === req.user._id.toString()) {
    return res
      .status(400)
      .json(ApiResponse.error("Cannot transfer to yourself", 400));
  }

  try {
    // Debit from sender
    const debitResult = await walletService.debitWallet(
      req.user._id,
      amount,
      `Transfer to ${recipientEmail}${note ? ": " + note : ""}`,
      {
        model: "WalletTransfer",
        id: recipient._id,
      },
    );

    // Credit to recipient
    const creditResult = await walletService.creditWallet(
      recipient._id,
      amount,
      `Transfer from ${req.user.email}${note ? ": " + note : ""}`,
      {
        model: "WalletTransfer",
        id: req.user._id,
      },
    );

    res.json(
      ApiResponse.success("Transfer completed successfully", {
        senderBalance: debitResult.wallet.balance,
        recipientBalance: creditResult.wallet.balance,
        amount,
        timestamp: new Date(),
      }),
    );
  } catch (error) {
    return res.status(400).json(ApiResponse.error(error.message, 400));
  }
});

module.exports = exports;
