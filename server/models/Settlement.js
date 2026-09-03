const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  settlementId: { type: String, required: true, unique: true, index: true },
  paymentId: { type: String, required: true, index: true },
  merchantId: { type: String, required: true, index: true },
  capturedAmount: { type: Number, required: true },
  fees: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  refundAmount: { type: Number, default: 0 },
  adjustments: { type: Number, default: 0 },
  expectedAmount: { type: Number, required: true },
  actualAmount: { type: Number, default: null },
  variance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'processed', 'reconciled', 'exception', 'investigating'],
    default: 'pending',
  },
  settledAt: { type: Date, default: null },
  reconciledAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Settlement', settlementSchema);
