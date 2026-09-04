const Payment = require('../models/Payment');
const Settlement = require('../models/Settlement');
const Reconciliation = require('../models/Reconciliation');
const RecoveryAction = require('../models/RecoveryAction');
const Merchant = require('../models/Merchant');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getDashboard = async (req, res, next) => {
  try {
    const merchantId = MERCHANT_ID;
    const merchant = await Merchant.findOne({ merchantId });

    const payments = await Payment.find({ merchantId });
    const totalPayments = payments.length;

    // Payment volume
    const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
    const capturedPayments = payments.filter(p => ['captured', 'settled', 'reconciled', 'recovered'].includes(p.status));
    const capturedVolume = capturedPayments.reduce((sum, p) => sum + p.amount, 0);

    // Failed/recoverable
    const failedStatuses = ['failed', 'recovery_recommended', 'at_risk', 'abandoned', 'review_required', 'blocked'];
    const failedPayments = payments.filter(p => failedStatuses.includes(p.status));
    const failedVolume = failedPayments.reduce((sum, p) => sum + p.amount, 0);

    const recoverablePayments = failedPayments.filter(p => p.recoveryProbability > 40 && p.riskScore < 75);
    const recoverableVolume = recoverablePayments.reduce((sum, p) => sum + p.amount, 0);
    const potentiallyRecoverableAmount = recoverablePayments.reduce(
      (sum, p) => sum + Math.round(p.amount * p.recoveryProbability / 100), 0
    );

    // Recovered by Pulse
    const recoveredPayments = payments.filter(p => p.status === 'recovered');
    const recoveredVolume = recoveredPayments.reduce((sum, p) => sum + p.amount, 0);

    // Revenue at risk (high risk or low recovery probability)
    const atRiskPayments = failedPayments.filter(p =>
      p.riskScore >= 75 || p.recoveryProbability <= 40 || p.status === 'blocked'
    );
    const revenueAtRisk = atRiskPayments.reduce((sum, p) => sum + p.amount, 0);

    // AI uplift (counterfactual)
    const baselineRecoveryRate = 0.19;
    const estimatedBaselineRecovery = Math.round(failedVolume * baselineRecoveryRate);
    const aiUplift = Math.max(0, recoveredVolume - estimatedBaselineRecovery);

    // Attention items
    const highRiskPayments = payments.filter(p => p.riskScore > 75 && failedStatuses.includes(p.status));
    const highRiskVolume = highRiskPayments.reduce((sum, p) => sum + p.amount, 0);

    // Settlement variance
    const settlements = await Settlement.find({ merchantId, status: 'exception' });
    const totalVariance = settlements.reduce((sum, s) => sum + Math.abs(s.variance), 0);

    const attentionItems = [
      {
        type: 'high_risk',
        severity: 'danger',
        count: highRiskPayments.length,
        amount: highRiskVolume,
        label: `${highRiskPayments.length} high-risk payments`,
        description: `₹${(highRiskVolume / 1000).toFixed(0)}K requires investigation`,
      },
      {
        type: 'recoverable',
        severity: 'warning',
        count: recoverablePayments.length,
        amount: recoverableVolume,
        label: `${recoverablePayments.length} recoverable failed payments`,
        description: `₹${(potentiallyRecoverableAmount / 1000).toFixed(0)}K potentially recoverable`,
      },
      {
        type: 'settlement_variance',
        severity: settlements.length > 0 ? 'warning' : 'success',
        count: settlements.length,
        amount: totalVariance,
        label: `₹${totalVariance.toLocaleString('en-IN')} settlement variance`,
        description: settlements.length > 0 ? 'Requires investigation' : 'All settlements matched',
      },
      {
        type: 'recovered',
        severity: 'success',
        count: recoveredPayments.length,
        amount: recoveredVolume,
        label: `₹${(recoveredVolume / 100000).toFixed(2)}L recovered automatically`,
        description: 'By Pulse AI',
      },
    ];

    // Payment method breakdown
    const methodBreakdown = {};
    for (const p of payments) {
      if (!methodBreakdown[p.method]) {
        methodBreakdown[p.method] = { total: 0, captured: 0, failed: 0, volume: 0 };
      }
      methodBreakdown[p.method].total++;
      methodBreakdown[p.method].volume += p.amount;
      if (['captured', 'settled', 'reconciled', 'recovered'].includes(p.status)) {
        methodBreakdown[p.method].captured++;
      } else if (failedStatuses.includes(p.status)) {
        methodBreakdown[p.method].failed++;
      }
    }

    res.json({
      success: true,
      data: {
        merchant: {
          name: merchant?.name || 'Vikram Mehta',
          businessName: merchant?.businessName || 'TrendCart India',
          autopilotMode: merchant?.autopilotMode || 'balanced',
        },
        paymentHealth: {
          totalVolume,
          capturedVolume,
          failedVolume,
          recoverableVolume: potentiallyRecoverableAmount,
          recoveredVolume,
          revenueAtRisk,
          aiUplift,
        },
        stats: {
          totalPayments,
          capturedCount: capturedPayments.length,
          failedCount: failedPayments.length,
          recoveredCount: recoveredPayments.length,
          successRate: totalPayments > 0 ? Math.round((capturedPayments.length / totalPayments) * 100) : 0,
          recoveryRate: failedPayments.length > 0 ? Math.round((recoveredPayments.length / failedPayments.length) * 100) : 0,
        },
        attentionItems,
        methodBreakdown,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};
