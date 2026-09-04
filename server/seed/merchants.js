function generateMerchant() {
  return {
    merchantId: 'MERCHANT_TRENDCART_001',
    name: 'Vikram Mehta',
    businessName: 'TrendCart India',
    businessType: 'ecommerce',
    email: 'vikram@trendcart.in',
    phone: '+919876543210',
    gst: '27AADCB2230M1ZT',
    bankAccount: 'XXXX XXXX 4521',
    ifsc: 'HDFC0001234',
    averageTicketSize: 3200,
    monthlyVolume: 4820000,
    autopilotMode: 'balanced',
    autopilotSettings: {
      maxAutoActionAmount: 25000,
      riskThreshold: 30,
      recoveryProbabilityThreshold: 60,
      manualReviewThreshold: 50000,
    },
    voiceLanguage: 'en',
  };
}

module.exports = { generateMerchant };
