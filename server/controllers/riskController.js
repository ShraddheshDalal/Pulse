const Payment = require('../models/Payment');
const RiskAssessment = require('../models/RiskAssessment');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getRiskSummary = async (req, res, next) => {
  try {
    const merchantId = MERCHANT_ID;
    const payments = await Payment.find({ merchantId, riskScore: { $gt: 0 } }).lean();

    const highRisk = payments.filter(p => p.riskScore > 50);
    const criticalRisk = payments.filter(p => p.riskScore > 75);
    const mediumRisk = payments.filter(p => p.riskScore > 20 && p.riskScore <= 50);
    const lowRisk = payments.filter(p => p.riskScore <= 20);

    const highRiskVolume = highRisk.reduce((s, p) => s + p.amount, 0);
    const blockedRecovery = payments.filter(p => p.status === 'blocked').reduce((s, p) => s + p.amount, 0);

    // Worth investigating: high risk but also high recovery probability
    const worthInvestigating = highRisk.filter(p => p.recoveryProbability > 50);
    const worthInvestigatingAmount = worthInvestigating.reduce((s, p) => s + p.amount, 0);

    // Risk distribution
    const riskDistribution = [
      { level: 'Low (0-20)', count: lowRisk.length, amount: lowRisk.reduce((s, p) => s + p.amount, 0) },
      { level: 'Medium (21-50)', count: mediumRisk.length, amount: mediumRisk.reduce((s, p) => s + p.amount, 0) },
      { level: 'High (51-75)', count: highRisk.filter(p => p.riskScore <= 75).length, amount: highRisk.filter(p => p.riskScore <= 75).reduce((s, p) => s + p.amount, 0) },
      { level: 'Critical (76-100)', count: criticalRisk.length, amount: criticalRisk.reduce((s, p) => s + p.amount, 0) },
    ];

    // Recent high-risk payments
    const recentHighRisk = highRisk
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        summary: {
          totalHighRisk: highRisk.length,
          highRiskVolume,
          criticalCount: criticalRisk.length,
          blockedRecovery,
          worthInvestigating: worthInvestigating.length,
          worthInvestigatingAmount,
          averageRiskScore: payments.length > 0 ? Math.round(payments.reduce((s, p) => s + p.riskScore, 0) / payments.length) : 0,
        },
        riskDistribution,
        recentHighRisk,
        insight: `₹${(highRiskVolume / 1000).toFixed(0)}K is high-risk, but only ₹${(worthInvestigatingAmount / 1000).toFixed(0)}K is worth further investigation.`,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRiskDetails = async (req, res, next) => {
  try {
    const { level, page = 1, limit = 20 } = req.query;
    const merchantId = MERCHANT_ID;

    const filter = { merchantId };
    if (level === 'high') filter.riskScore = { $gt: 50 };
    else if (level === 'medium') filter.riskScore = { $gt: 20, $lte: 50 };
    else if (level === 'low') filter.riskScore = { $lte: 20 };
    else if (level === 'critical') filter.riskScore = { $gt: 75 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter).sort('-riskScore').skip(skip).limit(parseInt(limit)).lean();

    res.json({
      success: true,
      data: {
        payments,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};
