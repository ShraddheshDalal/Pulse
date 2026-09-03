const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  totalTransactions: { type: Number, default: 0 },
  successfulTransactions: { type: Number, default: 0 },
  failedTransactions: { type: Number, default: 0 },
  totalSpend: { type: Number, default: 0 },
  averageOrderValue: { type: Number, default: 0 },
  preferredMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'], default: 'upi' },
  riskHistory: { type: Number, default: 0 },
  deviceFingerprints: [{ type: String }],
  firstTransactionAt: { type: Date },
  lastTransactionAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Customer', customerSchema);
