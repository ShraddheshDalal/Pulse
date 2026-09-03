const mongoose = require('mongoose');

const recoveryActionSchema = new mongoose.Schema({
  recoveryId: { type: String, required: true, unique: true, index: true },
  paymentId: { type: String, required: true, index: true },
  merchantId: { type: String, required: true, index: true },
  action: {
    type: String,
    enum: ['retry_same_method', 'offer_upi', 'offer_card', 'send_payment_link', 'retry_later', 'manual_review', 'block'],
    required: true,
  },
  predictedProbability: { type: Number, required: true, min: 0, max: 100 },
  expectedRevenue: { type: Number, required: true },
  risk: { type: Number, default: 0 },
  estimatedFriction: { type: Number, default: 0 },
  safeExpectedValue: { type: Number, default: 0 },
  executed: { type: Boolean, default: false },
  executedAt: { type: Date, default: null },
  executedBy: { type: String, enum: ['merchant', 'autopilot', null], default: null },
  outcome: { type: String, enum: ['success', 'failed', 'pending', null], default: null },
  outcomeAt: { type: Date, default: null },
  reasoning: { type: String },
  evidence: [{ type: String }],
  isRecommended: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RecoveryAction', recoveryActionSchema);
