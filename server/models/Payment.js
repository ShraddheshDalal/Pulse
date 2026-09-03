const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  merchantId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'], required: true },
  status: {
    type: String,
    enum: [
      'initiated', 'processing', 'captured', 'failed',
      'at_risk', 'recovery_recommended', 'recovery_in_progress',
      'recovered', 'settled', 'reconciled', 'refunded',
      'blocked', 'review_required', 'abandoned'
    ],
    default: 'initiated',
    index: true,
  },
  failureReason: {
    type: String,
    enum: [
      'insufficient_funds', 'bank_decline', 'network_timeout',
      'issuer_decline', 'limit_exceeded', 'expired_card',
      'technical_error', 'user_cancelled', null
    ],
    default: null,
  },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  description: { type: String },
  // Health scores
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  recoveryProbability: { type: Number, default: 0, min: 0, max: 100 },
  healthScore: { type: Number, default: 100, min: 0, max: 100 },
  customerIntent: { type: Number, default: 0, min: 0, max: 100 },
  legitimacyScore: { type: Number, default: 100, min: 0, max: 100 },
  settlementConfidence: { type: Number, default: 100, min: 0, max: 100 },
  // AI fields
  recommendedAction: { type: String, default: null },
  actualRecoveryAction: { type: String, default: null },
  outcome: { type: String, default: null },
  aiReasoning: { type: String, default: null },
  aiEvidence: [{ type: String }],
  // Priority
  priorityScore: { type: Number, default: 0 },
  attentionCategory: { type: String, enum: ['act_now', 'review', 'monitor', 'resolved', null], default: null },
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  processedAt: { type: Date, default: null },
  capturedAt: { type: Date, default: null },
  failedAt: { type: Date, default: null },
  recoveredAt: { type: Date, default: null },
  settledAt: { type: Date, default: null },
  reconciledAt: { type: Date, default: null },
  // Device
  deviceType: { type: String, default: 'mobile' },
  ipAddress: { type: String, default: null },
});

paymentSchema.index({ merchantId: 1, status: 1 });
paymentSchema.index({ merchantId: 1, createdAt: -1 });
paymentSchema.index({ merchantId: 1, attentionCategory: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
