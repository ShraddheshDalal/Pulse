const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  merchantId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, enum: ['retail', 'ecommerce', 'd2c', 'restaurant', 'service', 'sme'], required: true },
  email: { type: String, required: true },
  phone: { type: String },
  gst: { type: String },
  bankAccount: { type: String },
  ifsc: { type: String },
  averageTicketSize: { type: Number, default: 0 },
  monthlyVolume: { type: Number, default: 0 },
  autopilotMode: { type: String, enum: ['conservative', 'balanced', 'autonomous'], default: 'balanced' },
  autopilotSettings: {
    maxAutoActionAmount: { type: Number, default: 25000 },
    riskThreshold: { type: Number, default: 30 },
    recoveryProbabilityThreshold: { type: Number, default: 60 },
    manualReviewThreshold: { type: Number, default: 50000 },
  },
  voiceLanguage: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Merchant', merchantSchema);
