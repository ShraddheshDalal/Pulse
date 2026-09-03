const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  auditId: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  paymentId: { type: String, index: true },
  action: { type: String, required: true },
  decision: { type: String, required: true },
  reason: { type: String },
  riskScore: { type: Number, default: 0 },
  recoveryProbability: { type: Number, default: 0 },
  executedBy: { type: String, enum: ['merchant', 'autopilot', 'system'], required: true },
  result: { type: String, enum: ['success', 'failed', 'pending', 'blocked'], default: 'pending' },
  userOverride: { type: Boolean, default: false },
  modelVersion: { type: String, default: '1.0.0' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
