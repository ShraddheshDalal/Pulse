const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  insightId: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ['recovery_pattern', 'risk_trend', 'revenue_opportunity', 'settlement_pattern', 'behavioral', 'operational'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  impact: { type: String },
  impactAmount: { type: Number, default: 0 },
  evidence: { type: String },
  timePeriod: { type: String },
  sampleSize: { type: Number, default: 0 },
  confidence: { type: Number, default: 0, min: 0, max: 100 },
  recommendedAction: { type: String },
  category: { type: String },
  priority: { type: Number, default: 0 },
  isActionable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AIInsight', aiInsightSchema);
