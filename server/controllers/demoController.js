const Payment = require('../models/Payment');
const { MERCHANT_ID } = require('../utils/helpers');

const SCENARIOS = {
  1: {
    id: 1,
    title: 'Low-Risk Payment Failure',
    description: 'A ₹7,499 card payment fails due to issuer decline. Low risk, high recovery potential via UPI.',
    paymentId: 'PAY48291',
  },
  2: {
    id: 2,
    title: 'High-Risk Payment',
    description: 'An ₹85,000 payment with 94% risk score. Recovery blocked despite 90% recovery probability.',
    paymentId: 'PAY48292',
  },
  3: {
    id: 3,
    title: 'Settlement Mismatch',
    description: 'A settled payment with ₹400 variance between expected and actual settlement amounts.',
    paymentId: 'PAY48293',
  },
  4: {
    id: 4,
    title: 'Voice-Driven Operation',
    description: 'Demonstrate voice commands in English, Hindi, and Marathi to query and act on payments.',
    paymentId: null,
  },
  5: {
    id: 5,
    title: 'Abandoned Checkout Recovery',
    description: 'High-intent customer abandons checkout. Pulse recommends sending a payment link.',
    paymentId: null,
  },
  6: {
    id: 6,
    title: 'End-to-End Payment Journey',
    description: 'Complete lifecycle: initiated → failed → risk assessed → recovery simulated → recovered → settled → reconciled.',
    paymentId: 'PAY48291',
  },
};

exports.getScenarios = async (req, res, next) => {
  try {
    res.json({ success: true, data: { scenarios: Object.values(SCENARIOS) } });
  } catch (error) {
    next(error);
  }
};

exports.getScenario = async (req, res, next) => {
  try {
    const scenario = SCENARIOS[req.params.scenarioId];
    if (!scenario) return res.status(404).json({ success: false, error: 'Scenario not found' });

    let payment = null;
    if (scenario.paymentId) {
      payment = await Payment.findOne({ paymentId: scenario.paymentId }).lean();
    }

    // For scenario 5, find an abandoned payment
    if (scenario.id === 5) {
      payment = await Payment.findOne({ merchantId: MERCHANT_ID, status: 'abandoned' }).sort('-priorityScore').lean();
    }

    res.json({ success: true, data: { scenario, payment } });
  } catch (error) {
    next(error);
  }
};
