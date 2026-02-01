const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const WalletTransaction = require("../models/WalletTransaction");
const config = require("../config/env");

/**
 * Wallet Service - Handles all wallet operations
 * Supports both transactional (production with replica set) and non-transactional (development) modes
 */

/**
 * Check if MongoDB transactions are available
 * Transactions require replica set or sharded cluster
 */
const isTransactionSupported = () => {
  // In production, always try to use transactions
  if (config.NODE_ENV === "production") {
    return true;
  }

  // In development, disable transactions (standalone MongoDB)
  return false;
};

/**
 * Create wallet for a new user
 */
const createWallet = async (userId, session = null) => {
  try {
    const wallet = new Wallet({
      user: userId,
      balance: 0,
    });

    if (session) {
      await wallet.save({ session });
    } else {
      await wallet.save();
    }

    return wallet;
  } catch (error) {
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
};

/**
 * Get user's wallet
 */
const getWallet = async (userId) => {
  try {
    let wallet = await Wallet.findOne({ user: userId });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await createWallet(userId);
    }

    return wallet;
  } catch (error) {
    throw new Error(`Failed to get wallet: ${error.message}`);
  }
};

/**
 * Credit wallet (add money) - WITH transaction support
 */
const creditWalletWithTransaction = async (
  userId,
  amount,
  description,
  reference = null,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      wallet = await createWallet(userId, session);
    }

    // Store balance before credit
    const balanceBefore = wallet.balance;

    // Credit the wallet
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      type: "credit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      reference,
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { wallet, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to credit wallet: ${error.message}`);
  }
};

/**
 * Credit wallet (add money) - WITHOUT transaction support (for development)
 */
const creditWalletWithoutTransaction = async (
  userId,
  amount,
  description,
  reference = null,
) => {
  try {
    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = await createWallet(userId);
    }

    // Store balance before credit
    const balanceBefore = wallet.balance;

    // Credit the wallet
    wallet.balance += amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    // Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      type: "credit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      reference,
    });
    await transaction.save();

    return { wallet, transaction };
  } catch (error) {
    throw new Error(`Failed to credit wallet: ${error.message}`);
  }
};

/**
 * Credit wallet (add money)
 */
const creditWallet = async (userId, amount, description, reference = null) => {
  if (isTransactionSupported()) {
    return creditWalletWithTransaction(userId, amount, description, reference);
  } else {
    return creditWalletWithoutTransaction(
      userId,
      amount,
      description,
      reference,
    );
  }
};

/**
 * Debit wallet (subtract money) - WITH transaction support
 */
const debitWalletWithTransaction = async (
  userId,
  amount,
  description,
  reference = null,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get wallet
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Check sufficient balance
    if (!wallet.hasSufficientBalance(amount)) {
      throw new Error("Insufficient wallet balance");
    }

    // Store balance before debit
    const balanceBefore = wallet.balance;

    // Debit the wallet
    wallet.balance -= amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save({ session });

    // Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      type: "debit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      reference,
    });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return { wallet, transaction };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Debit wallet (subtract money) - WITHOUT transaction support (for development)
 */
const debitWalletWithoutTransaction = async (
  userId,
  amount,
  description,
  reference = null,
) => {
  try {
    // Get wallet
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Check sufficient balance
    if (!wallet.hasSufficientBalance(amount)) {
      throw new Error("Insufficient wallet balance");
    }

    // Store balance before debit
    const balanceBefore = wallet.balance;

    // Debit the wallet
    wallet.balance -= amount;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    // Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      type: "debit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      reference,
    });
    await transaction.save();

    return { wallet, transaction };
  } catch (error) {
    throw error;
  }
};

/**
 * Debit wallet (subtract money)
 */
const debitWallet = async (userId, amount, description, reference = null) => {
  if (isTransactionSupported()) {
    return debitWalletWithTransaction(userId, amount, description, reference);
  } else {
    return debitWalletWithoutTransaction(
      userId,
      amount,
      description,
      reference,
    );
  }
};

/**
 * Get wallet transaction history
 */
const getTransactionHistory = async (userId, page = 1, limit = 20) => {
  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return { transactions: [], total: 0 };
    }

    const skip = (page - 1) * limit;

    const transactions = await WalletTransaction.find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("reference.id");

    const total = await WalletTransaction.countDocuments({
      wallet: wallet._id,
    });

    return { transactions, total };
  } catch (error) {
    throw new Error(`Failed to get transaction history: ${error.message}`);
  }
};

/**
 * Process order payment from wallet
 */
const processOrderPayment = async (userId, orderId, amount) => {
  try {
    const result = await debitWallet(userId, amount, "Order payment", {
      model: "Order",
      id: orderId,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Refund order to wallet (for cancelled orders)
 */
const refundOrderToWallet = async (userId, orderId, amount) => {
  try {
    const result = await creditWallet(userId, amount, "Order refund", {
      model: "Order",
      id: orderId,
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to refund to wallet: ${error.message}`);
  }
};

/**
 * Check if user has sufficient balance
 */
const hasSufficientBalance = async (userId, amount) => {
  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return false;
    }

    return wallet.hasSufficientBalance(amount);
  } catch (error) {
    return false;
  }
};

module.exports = {
  createWallet,
  getWallet,
  creditWallet,
  debitWallet,
  getTransactionHistory,
  processOrderPayment,
  refundOrderToWallet,
  hasSufficientBalance,
};
