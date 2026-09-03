const Payment = require('../models/Payment');
const RecoveryAction = require('../models/RecoveryAction');
const AuditLog = require('../models/AuditLog');
const Merchant = require('../models/Merchant');
const { MERCHANT_ID } = require('../utils/helpers');
const { generateId } = require('../seed/helpers');

exports.simulateRecovery = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findOne({ paymentId }).lean();
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    const recoveryOptions = await RecoveryAction.find({ paymentId }).sort('-safeExpectedValue').lean();

    if (recoveryOptions.length === 0) {
      return res.json({
        success: true,
        data: {
          payment: { paymentId: payment.paymentId, amount: payment.amount, customerName: payment.customerName },
          options: [],
          message: 'No recovery options available for this payment.',
        },
      });
    }

    const recommended = recoveryOptions.find(r => r.isRecommended) || recoveryOptions[0];

    res.json({
      success: true,
      data: {
        payment: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          customerName: payment.customerName,
          failureReason: payment.failureReason,
          method: payment.method,
          riskScore: payment.riskScore,
        },
        options: recoveryOptions.map(o => ({
          action: o.action,
          predictedProbability: o.predictedProbability,
          expectedRevenue: o.expectedRevenue,
          risk: o.risk,
          estimatedFriction: o.estimatedFriction,
          safeExpectedValue: o.safeExpectedValue,
          isRecommended: o.isRecommended,
          reasoning: o.reasoning,
        })),
        recommended: {
          action: recommended.action,
          probability: recommended.predictedProbability,
          expectedRevenue: recommended.expectedRevenue,
          reasoning: recommended.reasoning || payment.aiReasoning,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.executeRecovery = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    const { action } = req.body;

    const payment = await Payment.findOne({ paymentId });
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    // Check autopilot rules
    const merchant = await Merchant.findOne({ merchantId: MERCHANT_ID });
    const autopilot = merchant?.autopilotSettings || {};

    if (payment.riskScore > (autopilot.riskThreshold || 30) && payment.amount > (autopilot.maxAutoActionAmount || 25000)) {
      // Check if this needs manual review
      if (action !== 'block' && action !== 'manual_review') {
        // Still allow execution if merchant explicitly requested it
      }
    }

    // Execute recovery
    const recoveryAction = await RecoveryAction.findOne({ paymentId, action });
    const selectedAction = recoveryAction || { predictedProbability: 50, expectedRevenue: payment.amount * 0.5 };

    // Simulate outcome: use the predicted probability to determine success
    const isSuccess = selectedAction.predictedProbability > 40;

    // Update payment
    payment.status = isSuccess ? 'recovered' : 'failed';
    payment.actualRecoveryAction = action;
    payment.outcome = isSuccess ? 'recovered' : 'recovery_failed';
    payment.recoveredAt = isSuccess ? new Date() : null;
    payment.attentionCategory = isSuccess ? 'resolved' : 'review';
    await payment.save();

    // Update recovery action
    if (recoveryAction) {
      recoveryAction.executed = true;
      recoveryAction.executedAt = new Date();
      recoveryAction.executedBy = 'merchant';
      recoveryAction.outcome = isSuccess ? 'success' : 'failed';
      recoveryAction.outcomeAt = new Date();
      await recoveryAction.save();
    }

    // Create audit log
    const auditCount = await AuditLog.countDocuments();
    await AuditLog.create({
      auditId: generateId('AUD', auditCount + 1000),
      merchantId: MERCHANT_ID,
      paymentId,
      action,
      decision: `Execute ${action}`,
      reason: payment.aiReasoning || `Recovery action ${action} executed`,
      riskScore: payment.riskScore,
      recoveryProbability: payment.recoveryProbability,
      executedBy: 'merchant',
      result: isSuccess ? 'success' : 'failed',
      userOverride: false,
      modelVersion: '1.0.0',
    });

    // If recovered, create settlement
    if (isSuccess) {
      const Settlement = require('../models/Settlement');
      const stlCount = await Settlement.countDocuments();
      const fees = Math.round(payment.amount * 0.02);
      const tax = Math.round(fees * 0.18);
      const expectedAmount = payment.amount - fees - tax;

      await Settlement.create({
        settlementId: generateId('STL', stlCount + 1000),
        paymentId,
        merchantId: MERCHANT_ID,
        capturedAmount: payment.amount,
        fees,
        tax,
        refundAmount: 0,
        adjustments: 0,
        expectedAmount,
        actualAmount: expectedAmount,
        variance: 0,
        status: 'reconciled',
        settledAt: new Date(Date.now() + 2 * 86400000),
        reconciledAt: new Date(Date.now() + 2 * 86400000),
      });
    }

    res.json({
      success: true,
      data: {
        paymentId,
        action,
        outcome: isSuccess ? 'recovered' : 'failed',
        payment: {
          status: payment.status,
          amount: payment.amount,
          recoveredAt: payment.recoveredAt,
        },
        revenueImpact: isSuccess ? {
          recovered: payment.amount,
          withoutPulse: Math.round(payment.amount * 0.19),
          incrementalImpact: Math.round(payment.amount * 0.81),
          label: 'Modelled incremental impact',
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecoverySummary = async (req, res, next) => {
  try {
    const merchantId = MERCHANT_ID;
    const payments = await Payment.find({ merchantId }).lean();
    const failedStatuses = ['failed', 'recovery_recommended', 'at_risk', 'abandoned', 'review_required'];

    const failedPayments = payments.filter(p => failedStatuses.includes(p.status));
    const recoveredPayments = payments.filter(p => p.status === 'recovered');
    const blockedPayments = payments.filter(p => p.status === 'blocked');

    const totalFailedAmount = failedPayments.reduce((s, p) => s + p.amount, 0);
    const totalRecoveredAmount = recoveredPayments.reduce((s, p) => s + p.amount, 0);
    const totalBlockedAmount = blockedPayments.reduce((s, p) => s + p.amount, 0);
    const recoverableAmount = failedPayments
      .filter(p => p.recoveryProbability > 40 && p.riskScore < 75)
      .reduce((s, p) => s + Math.round(p.amount * p.recoveryProbability / 100), 0);

    // Leakage breakdown
    const leakage = {
      temporaryFailures: failedPayments
        .filter(p => ['network_timeout', 'issuer_decline', 'technical_error'].includes(p.failureReason))
        .reduce((s, p) => s + p.amount, 0),
      customerAbandonment: failedPayments
        .filter(p => p.failureReason === 'user_cancelled' || p.status === 'abandoned')
        .reduce((s, p) => s + p.amount, 0),
      riskHolds: blockedPayments.reduce((s, p) => s + p.amount, 0),
      permanentDeclines: failedPayments
        .filter(p => ['expired_card', 'limit_exceeded'].includes(p.failureReason))
        .reduce((s, p) => s + p.amount, 0),
      unresolved: failedPayments
        .filter(p => ['insufficient_funds', 'bank_decline'].includes(p.failureReason))
        .reduce((s, p) => s + p.amount, 0),
    };

    // Recovery by method
    const recoveryByMethod = {};
    for (const p of recoveredPayments) {
      const method = p.actualRecoveryAction || 'unknown';
      if (!recoveryByMethod[method]) recoveryByMethod[method] = { count: 0, amount: 0 };
      recoveryByMethod[method].count++;
      recoveryByMethod[method].amount += p.amount;
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalFailed: failedPayments.length,
          totalFailedAmount,
          totalRecovered: recoveredPayments.length,
          totalRecoveredAmount,
          totalBlocked: blockedPayments.length,
          totalBlockedAmount,
          recoverableAmount,
          recoveryRate: failedPayments.length > 0
            ? Math.round((recoveredPayments.length / (failedPayments.length + recoveredPayments.length)) * 100)
            : 0,
        },
        leakage,
        recoveryByMethod,
      },
    });
  } catch (error) {
    next(error);
  }
};
