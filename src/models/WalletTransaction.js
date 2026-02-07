const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    model: {
      type: String,
      enum: ['Order', 'Payment', 'WalletTransfer']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
walletTransactionSchema.index({ wallet: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1 });
walletTransactionSchema.index({ 'reference.model': 1, 'reference.id': 1 });

// Make transactions immutable after creation
walletTransactionSchema.pre('save', function() {
  if (!this.isNew) {
    throw new Error('Wallet transactions cannot be modified after creation');
  }
});

// Prevent deletion
walletTransactionSchema.pre('remove', function() {
  throw new Error('Wallet transactions cannot be deleted');
});

walletTransactionSchema.pre('deleteOne', function() {
  throw new Error('Wallet transactions cannot be deleted');
});

walletTransactionSchema.pre('deleteMany', function() {
  throw new Error('Wallet transactions cannot be deleted');
});

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
