const Payment = require('../models/Payment');
const PaymentAttempt = require('../models/PaymentAttempt');
const RiskAssessment = require('../models/RiskAssessment');
const RecoveryAction = require('../models/RecoveryAction');
const Settlement = require('../models/Settlement');
const Reconciliation = require('../models/Reconciliation');
const Customer = require('../models/Customer');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getPayments = async (req, res, next) => {
  try {
    const merchantId = MERCHANT_ID;
    const { page = 1, limit = 20, status, method, risk, minAmount, maxAmount, search, sort = '-createdAt' } = req.query;

    const filter = { merchantId };
    if (status) filter.status = { $in: status.split(',') };
    if (method) filter.method = { $in: method.split(',') };
    if (risk === 'high') filter.riskScore = { $gt: 50 };
    if (risk === 'low') filter.riskScore = { $lte: 20 };
    if (risk === 'medium') filter.riskScore = { $gt: 20, $lte: 50 };
    if (minAmount) filter.amount = { ...filter.amount, $gte: parseInt(minAmount) };
    if (maxAmount) filter.amount = { ...filter.amount, $lte: parseInt(maxAmount) };
    if (search) {
      filter.$or = [
        { paymentId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { orderId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id }).lean();
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    const customer = await Customer.findOne({ customerId: payment.customerId }).lean();

    res.json({ success: true, data: { payment, customer } });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentJourney = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findOne({ paymentId }).lean();
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    const attempts = await PaymentAttempt.find({ paymentId }).sort('timestamp').lean();
    const riskAssessment = await RiskAssessment.findOne({ paymentId }).lean();
    const recoveryActions = await RecoveryAction.find({ paymentId }).lean();
    const settlement = await Settlement.findOne({ paymentId }).lean();
    const reconciliation = await Reconciliation.findOne({ paymentId }).lean();

    // Build timeline
    const timeline = [];

    timeline.push({
      timestamp: payment.createdAt,
      event: 'Payment Initiated',
      detail: `₹${payment.amount.toLocaleString('en-IN')} via ${payment.method.toUpperCase()}`,
      type: 'info',
    });

    for (const attempt of attempts) {
      if (attempt.status === 'failed') {
        timeline.push({
          timestamp: attempt.timestamp,
          event: `${attempt.method.toUpperCase()} ${attempt.isRecoveryAttempt ? 'Recovery ' : ''}Failed`,
          detail: attempt.failureReason ? attempt.failureReason.replace(/_/g, ' ') : 'Unknown',
          type: 'error',
        });
      } else if (attempt.status === 'success') {
        timeline.push({
          timestamp: attempt.timestamp,
          event: `Payment ${attempt.isRecoveryAttempt ? 'Recovered' : 'Successful'}`,
          detail: `via ${attempt.method.toUpperCase()}`,
          type: 'success',
        });
      }
    }

    if (riskAssessment) {
      timeline.push({
        timestamp: riskAssessment.createdAt,
        event: 'Risk Evaluated',
        detail: `Risk: ${riskAssessment.riskScore}% (${riskAssessment.riskLevel})`,
        type: riskAssessment.riskScore > 50 ? 'warning' : 'info',
      });
    }

    if (payment.recoveryProbability > 0) {
      timeline.push({
        timestamp: new Date(payment.createdAt.getTime() + 7000),
        event: 'Recovery Probability Assessed',
        detail: `${payment.recoveryProbability}% recovery probability`,
        type: 'info',
      });
    }

    if (payment.recommendedAction) {
      const actionLabels = {
        offer_upi: 'UPI recommended', retry_same_method: 'Retry recommended',
        send_payment_link: 'Payment link recommended', retry_later: 'Delayed retry recommended',
        manual_review: 'Manual review recommended', block: 'Recovery blocked',
      };
      timeline.push({
        timestamp: new Date(payment.createdAt.getTime() + 8000),
        event: actionLabels[payment.recommendedAction] || payment.recommendedAction,
        detail: payment.aiReasoning,
        type: payment.recommendedAction === 'block' ? 'error' : 'ai',
      });
    }

    const executedRecovery = recoveryActions.find(r => r.executed);
    if (executedRecovery) {
      timeline.push({
        timestamp: executedRecovery.executedAt,
        event: 'Recovery Executed',
        detail: `${executedRecovery.action.replace(/_/g, ' ')} by ${executedRecovery.executedBy}`,
        type: 'action',
      });
    }

    if (settlement) {
      if (settlement.settledAt) {
        timeline.push({
          timestamp: settlement.settledAt,
          event: 'Settlement Processed',
          detail: `Fees: ₹${settlement.fees} | GST: ₹${settlement.tax} | Net: ₹${settlement.expectedAmount.toLocaleString('en-IN')}`,
          type: 'info',
        });
      }
      if (settlement.status === 'reconciled' || settlement.status === 'exception') {
        timeline.push({
          timestamp: settlement.reconciledAt || settlement.settledAt,
          event: settlement.variance === 0 ? 'Reconciled ✓' : `Variance: ₹${settlement.variance}`,
          detail: settlement.variance === 0 ? 'Settlement matches expected amount' : 'Investigation required',
          type: settlement.variance === 0 ? 'success' : 'warning',
        });
      }
    }

    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: { payment, timeline, riskAssessment, recoveryActions, settlement, reconciliation },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentHealth = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.id }).lean();
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    res.json({
      success: true,
      data: {
        healthScore: payment.healthScore,
        breakdown: {
          legitimacy: payment.legitimacyScore,
          customerIntent: payment.customerIntent,
          recoveryPotential: payment.recoveryProbability,
          settlementConfidence: payment.settlementConfidence,
          risk: payment.riskScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentRisk = async (req, res, next) => {
  try {
    const riskAssessment = await RiskAssessment.findOne({ paymentId: req.params.id }).lean();
    if (!riskAssessment) {
      const payment = await Payment.findOne({ paymentId: req.params.id }).lean();
      if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
      return res.json({
        success: true,
        data: {
          riskScore: payment.riskScore,
          riskLevel: payment.riskScore <= 20 ? 'low' : payment.riskScore <= 50 ? 'medium' : payment.riskScore <= 75 ? 'high' : 'critical',
          signals: [],
          explanation: 'No significant risk signals detected.',
        },
      });
    }

    res.json({ success: true, data: riskAssessment });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentRecoveryOptions = async (req, res, next) => {
  try {
    const recoveryActions = await RecoveryAction.find({ paymentId: req.params.id }).sort('-safeExpectedValue').lean();
    const payment = await Payment.findOne({ paymentId: req.params.id }).lean();

    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    // "What if I do nothing" calculation
    const doNothingRecovery = Math.round(payment.amount * 0.19);
    const doNothingLost = payment.amount - doNothingRecovery;

    const recommended = recoveryActions.find(r => r.isRecommended);
    const recommendedRecovery = recommended ? recommended.expectedRevenue : 0;

    res.json({
      success: true,
      data: {
        payment: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          customerName: payment.customerName,
          failureReason: payment.failureReason,
          riskScore: payment.riskScore,
          recoveryProbability: payment.recoveryProbability,
        },
        options: recoveryActions,
        recommended: recommended || null,
        doNothing: {
          estimatedRecovery: doNothingRecovery,
          expectedLostRevenue: doNothingLost,
          recoveryRate: 19,
        },
        whyThisPayment: {
          reasons: payment.aiEvidence || [],
          expectedValue: recommendedRecovery,
          priorityScore: payment.priorityScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
