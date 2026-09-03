const mongoose = require('mongoose');

const reconciliationSchema = new mongoose.Schema({
  reconciliationId: { type: String, required: true, unique: true, index: true },
  settlementId: { type: String, required: true, index: true },
  paymentId: { type: String, required: true, index: true },
  merchantId: { type: String, required: true, index: true },
  expectedAmount: { type: Number, required: true },
  actualAmount: { type: Number, required: true },
  variance: { type: Number, required: true },
  varianceType: {
    type: String,
    enum: ['none', 'fee_adjustment', 'tax_adjustment', 'refund', 'settlement_adjustment', 'timing_difference', 'unknown'],
    default: 'none',
  },
  status: {
    type: String,
    enum: ['matched', 'exception', 'investigating', 'resolved'],
    default: 'matched',
  },
  investigation: {
    likelyCause: { type: String, default: null },
    confidence: { type: Number, default: null },
    evidence: [{
      step: { type: String },
      status: { type: String, enum: ['match', 'mismatch', 'warning'] },
      detail: { type: String },
    }],
    recommendation: { type: String, default: null },
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },
});

module.exports = mongoose.model('Reconciliation', reconciliationSchema);
