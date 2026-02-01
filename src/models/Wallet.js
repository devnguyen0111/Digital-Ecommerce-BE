const mongoose = require('mongoose');
const config = require('../config/env');

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Wallet balance cannot be negative']
  },
  currency: {
    type: String,
    default: config.DEFAULT_CURRENCY,
    uppercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTransactionAt: Date
}, {
  timestamps: true
});

// Indexes (user field already has unique: true which creates an index automatically)
// walletSchema.index({ user: 1 }); // REMOVED: duplicate with unique: true

// Method to check if wallet has sufficient balance
walletSchema.methods.hasSufficientBalance = function(amount) {
  return this.balance >= amount && amount > 0;
};

// Method to credit wallet (add money)
walletSchema.methods.credit = async function(amount, session = null) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive');
  }
  
  this.balance += amount;
  this.lastTransactionAt = new Date();
  
  if (session) {
    return await this.save({ session });
  }
  return await this.save();
};

// Method to debit wallet (subtract money)
walletSchema.methods.debit = async function(amount, session = null) {
  if (amount <= 0) {
    throw new Error('Debit amount must be positive');
  }
  
  if (!this.hasSufficientBalance(amount)) {
    throw new Error('Insufficient wallet balance');
  }
  
  this.balance -= amount;
  this.lastTransactionAt = new Date();
  
  if (session) {
    return await this.save({ session });
  }
  return await this.save();
};

module.exports = mongoose.model('Wallet', walletSchema);
