const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');

/**
 * Wallet Service - Handles all wallet operations
 */

/**
 * Create wallet for a new user
 */
const createWallet = async (userId, session = null) => {
  try {
    const wallet = new Wallet({
      user: userId,
      balance: 0
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
 * Credit wallet (add money)
 */
const creditWallet = async (userId, amount, description, reference = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get or create wallet
    let wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      wallet = await createWallet(userId, session);
    }

    // Credit the wallet
    await wallet.credit(amount, session);

    // Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      type: 'credit',
      amount,
      balanceAfter: wallet.balance,
      description,
      reference
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
 * Debit wallet (subtract money)
 */
const debitWallet = async (userId, amount, description, reference = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get wallet
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Check sufficient balance
    if (!wallet.hasSufficientBalance(amount)) {
      throw new Error('Insufficient wallet balance');
    }

    // Debit the wallet
    await wallet.debit(amount, session);

    // Create transaction record
    const transaction = new WalletTransaction({
      wallet: wallet._id,
      type: 'debit',
      amount,
      balanceAfter: wallet.balance,
      description,
      reference
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
      .populate('reference.id');

    const total = await WalletTransaction.countDocuments({ wallet: wallet._id });

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
    const result = await debitWallet(
      userId,
      amount,
      'Order payment',
      {
        model: 'Order',
        id: orderId
      }
    );

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
    const result = await creditWallet(
      userId,
      amount,
      'Order refund',
      {
        model: 'Order',
        id: orderId
      }
    );

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
  hasSufficientBalance
};
