const mongoose = require('mongoose');

const merchantPlaybookSchema = new mongoose.Schema({
  playbookId: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  scenario: { type: String, required: true },
  scenarioType: {
    type: String,
    enum: ['card_failure', 'upi_timeout', 'high_value', 'abandoned_checkout', 'repeat_failure', 'new_customer', 'bank_decline'],
    required: true,
  },
  recommendedAction: { type: String, required: true },
  successRate: { type: Number, required: true, min: 0, max: 100 },
  sampleSize: { type: Number, required: true },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  averageRecoveryAmount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MerchantPlaybook', merchantPlaybookSchema);
