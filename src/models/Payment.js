const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "VND",
      uppercase: true,
    },
    method: {
      type: String,
      enum: ["wallet", "payos"],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "success",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    // PayOS specific fields
    payosOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    payosTransactionId: String,
    payosPaymentLinkId: String,
    paymentUrl: String,

    // Transaction details
    description: String,

    // Metadata
    metadata: {
      type: Map,
      of: String,
    },

    // Status tracking
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Timestamps for different statuses
    processedAt: Date,
    completedAt: Date,
    failedAt: Date,
    refundedAt: Date,

    failureReason: String,
    refundReason: String,
  },
  {
    timestamps: true,
  },
);

// Indexes (compound and single indexes only, no field-level index: true)
paymentSchema.index({ user: 1, createdAt: -1 }); // Compound index for user queries with sorting
paymentSchema.index({ order: 1 });
paymentSchema.index({ status: 1 });
// payosOrderId already has unique: true, sparse: true in schema definition (acts as index)

// Add status change to history
paymentSchema.methods.updateStatus = function (status, message = "") {
  this.statusHistory.push({
    status,
    message,
    timestamp: new Date(),
  });
  this.status = status;

  // Update timestamp fields based on status
  const now = new Date();
  switch (status) {
    case "processing":
      this.processedAt = now;
      break;
    case "success":
      this.completedAt = now;
      break;
    case "failed":
      this.failedAt = now;
      break;
    case "refunded":
      this.refundedAt = now;
      break;
  }
};

module.exports = mongoose.model("Payment", paymentSchema);
