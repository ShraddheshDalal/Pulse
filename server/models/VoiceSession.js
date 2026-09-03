const mongoose = require('mongoose');

const voiceSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  merchantId: { type: String, required: true, index: true },
  language: { type: String, enum: ['en', 'hi', 'mr'], default: 'en' },
  commands: [{
    transcript: { type: String, required: true },
    intent: { type: String },
    response: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    requiresConfirmation: { type: Boolean, default: false },
    confirmed: { type: Boolean, default: null },
    timestamp: { type: Date, default: Date.now },
  }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

module.exports = mongoose.model('VoiceSession', voiceSessionSchema);
