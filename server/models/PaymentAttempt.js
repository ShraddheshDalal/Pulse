const mongoose = require('mongoose');

const paymentAttemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true, index: true },
  paymentId: { type: String, required: true, index: true },
  merchantId: { type: String, required: true, index: true },
  method: { type: String, enum: ['upi', 'card', 'netbanking', 'wallet'], required: true },
  status: { type: String, enum: ['initiated', 'processing', 'success', 'failed'], default: 'initiated' },
  failureReason: { type: String, default: null },
  deviceType: { type: String, default: 'mobile' },
  customerIntent: { type: Number, default: 50, min: 0, max: 100 },
  riskSignals: [{
    signal: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    description: { type: String },
  }],
  isRecoveryAttempt: { type: Boolean, default: false },
  recoveryMethod: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 }, // milliseconds
});

module.exports = mongoose.model('PaymentAttempt', paymentAttemptSchema);
