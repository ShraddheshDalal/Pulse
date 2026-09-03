const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, index: true },
  merchantId: { type: String, required: true, index: true },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  signals: [{
    signal: { type: String, required: true },
    weight: { type: Number, required: true },
    description: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  }],
  explanation: { type: String },
  modelVersion: { type: String, default: '1.0.0' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
