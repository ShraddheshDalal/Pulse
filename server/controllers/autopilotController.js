const Merchant = require('../models/Merchant');
const Payment = require('../models/Payment');
const AuditLog = require('../models/AuditLog');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getAutopilot = async (req, res, next) => {
  try {
    const merchant = await Merchant.findOne({ merchantId: MERCHANT_ID }).lean();

    // Get recent autopilot actions
    const recentActions = await AuditLog.find({
      merchantId: MERCHANT_ID,
      executedBy: 'autopilot',
    }).sort('-timestamp').limit(20).lean();

    // Stats
    const allAutopilotActions = await AuditLog.find({ merchantId: MERCHANT_ID, executedBy: 'autopilot' }).lean();
    const successCount = allAutopilotActions.filter(a => a.result === 'success').length;
    const blockedCount = allAutopilotActions.filter(a => a.result === 'blocked').length;

    res.json({
      success: true,
      data: {
        mode: merchant?.autopilotMode || 'balanced',
        settings: merchant?.autopilotSettings || {
          maxAutoActionAmount: 25000,
          riskThreshold: 30,
          recoveryProbabilityThreshold: 60,
          manualReviewThreshold: 50000,
        },
        stats: {
          totalActions: allAutopilotActions.length,
          successCount,
          blockedCount,
          successRate: allAutopilotActions.length > 0 ? Math.round((successCount / allAutopilotActions.length) * 100) : 0,
        },
        recentActions,
        modes: {
          conservative: {
            label: 'Conservative',
            description: 'AI recommends. Human approves all actions.',
          },
          balanced: {
            label: 'Balanced',
            description: 'AI automatically handles low-risk, high-confidence cases. Medium/high-risk requires review.',
          },
          autonomous: {
            label: 'Autonomous',
            description: 'AI handles all eligible cases automatically. Only critical-risk actions require human approval.',
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateAutopilot = async (req, res, next) => {
  try {
    const { mode, settings } = req.body;
    const update = {};
    if (mode) update.autopilotMode = mode;
    if (settings) update.autopilotSettings = settings;

    const merchant = await Merchant.findOneAndUpdate(
      { merchantId: MERCHANT_ID },
      update,
      { new: true }
    ).lean();

    res.json({ success: true, data: { mode: merchant.autopilotMode, settings: merchant.autopilotSettings } });
  } catch (error) {
    next(error);
  }
};

exports.autopilotDecision = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findOne({ paymentId }).lean();
    if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });

    const merchant = await Merchant.findOne({ merchantId: MERCHANT_ID }).lean();
    const settings = merchant?.autopilotSettings || {};
    const mode = merchant?.autopilotMode || 'balanced';

    let canAutoExecute = false;
    let reason = '';

    if (mode === 'conservative') {
      canAutoExecute = false;
      reason = 'Conservative mode: all actions require human approval.';
    } else if (mode === 'balanced') {
      canAutoExecute =
        payment.riskScore <= (settings.riskThreshold || 30) &&
        payment.recoveryProbability >= (settings.recoveryProbabilityThreshold || 60) &&
        payment.amount <= (settings.maxAutoActionAmount || 25000);
      reason = canAutoExecute
        ? 'Balanced mode: payment meets all auto-execution criteria.'
        : `Balanced mode: payment doesn't meet criteria (risk: ${payment.riskScore}, recovery: ${payment.recoveryProbability}%, amount: ₹${payment.amount}).`;
    } else if (mode === 'autonomous') {
      canAutoExecute = payment.riskScore <= 75;
      reason = canAutoExecute
        ? 'Autonomous mode: risk below critical threshold.'
        : 'Autonomous mode: critical risk requires human approval.';
    }

    res.json({
      success: true,
      data: {
        paymentId,
        canAutoExecute,
        reason,
        mode,
        recommendedAction: payment.recommendedAction,
        riskScore: payment.riskScore,
        recoveryProbability: payment.recoveryProbability,
      },
    });
  } catch (error) {
    next(error);
  }
};
