const Payment = require('../models/Payment');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getAttentionItems = async (req, res, next) => {
  try {
    const merchantId = MERCHANT_ID;
    const { category } = req.query;

    const filter = { merchantId, attentionCategory: { $ne: null } };
    if (category) filter.attentionCategory = category;

    const payments = await Payment.find(filter).sort('-priorityScore').lean();

    const actNow = payments.filter(p => p.attentionCategory === 'act_now');
    const review = payments.filter(p => p.attentionCategory === 'review');
    const monitor = payments.filter(p => p.attentionCategory === 'monitor');
    const resolved = payments.filter(p => p.attentionCategory === 'resolved').slice(0, 20);

    // Format attention items with business context
    const formatItem = (p) => ({
      paymentId: p.paymentId,
      amount: p.amount,
      customerName: p.customerName,
      status: p.status,
      method: p.method,
      failureReason: p.failureReason,
      riskScore: p.riskScore,
      recoveryProbability: p.recoveryProbability,
      recommendedAction: p.recommendedAction,
      priorityScore: p.priorityScore,
      aiReasoning: p.aiReasoning,
      createdAt: p.createdAt,
      // Business-friendly descriptions
      what: getWhatDescription(p),
      why: getWhyDescription(p),
      impact: `₹${p.amount.toLocaleString('en-IN')} potential revenue`,
      recommendedActionLabel: getActionDescription(p),
    });

    res.json({
      success: true,
      data: {
        summary: {
          actNowCount: actNow.length,
          actNowAmount: actNow.reduce((s, p) => s + p.amount, 0),
          reviewCount: review.length,
          reviewAmount: review.reduce((s, p) => s + p.amount, 0),
          monitorCount: monitor.length,
          resolvedCount: resolved.length,
        },
        actNow: actNow.map(formatItem),
        review: review.map(formatItem),
        monitor: monitor.map(formatItem),
        resolved: resolved.map(formatItem),
      },
    });
  } catch (error) {
    next(error);
  }
};

function getWhatDescription(payment) {
  if (payment.status === 'blocked') return `₹${payment.amount.toLocaleString('en-IN')} high-risk payment blocked`;
  if (payment.status === 'recovery_recommended') return `₹${payment.amount.toLocaleString('en-IN')} payment failed — recovery available`;
  if (payment.status === 'at_risk') return `₹${payment.amount.toLocaleString('en-IN')} payment at risk`;
  if (payment.status === 'failed') return `₹${payment.amount.toLocaleString('en-IN')} payment failed`;
  if (payment.status === 'abandoned') return `₹${payment.amount.toLocaleString('en-IN')} checkout abandoned`;
  if (payment.status === 'review_required') return `₹${payment.amount.toLocaleString('en-IN')} requires manual review`;
  if (payment.status === 'recovered') return `₹${payment.amount.toLocaleString('en-IN')} recovered`;
  return `₹${payment.amount.toLocaleString('en-IN')} payment — ${payment.status}`;
}

function getWhyDescription(payment) {
  if (payment.failureReason) {
    const reasons = {
      insufficient_funds: 'Customer did not have sufficient funds',
      bank_decline: 'Customer\'s bank declined the transaction',
      network_timeout: 'Payment timed out due to network issues',
      issuer_decline: 'Card issuer temporarily declined the payment',
      limit_exceeded: 'Transaction exceeded customer\'s limit',
      expired_card: 'Customer\'s card has expired',
      technical_error: 'A technical error occurred during processing',
      user_cancelled: 'Customer cancelled the payment',
    };
    return reasons[payment.failureReason] || payment.failureReason;
  }
  if (payment.riskScore > 75) return 'Multiple risk signals detected';
  return 'Payment processing issue';
}

function getActionDescription(payment) {
  if (!payment.recommendedAction) return null;
  const actions = {
    offer_upi: 'Offer UPI as alternative payment',
    retry_same_method: 'Retry with same payment method',
    send_payment_link: 'Send payment link to customer',
    retry_later: 'Schedule retry for later',
    manual_review: 'Manual review required',
    block: 'Block — risk too high',
    offer_card: 'Offer card payment',
  };
  return actions[payment.recommendedAction] || payment.recommendedAction;
}
