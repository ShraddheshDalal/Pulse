const Settlement = require('../models/Settlement');
const Reconciliation = require('../models/Reconciliation');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getSettlements = async (req, res, next) => {
  try {
    const merchantId = MERCHANT_ID;
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { merchantId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Settlement.countDocuments(filter);
    const settlements = await Settlement.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit)).lean();

    const allSettlements = await Settlement.find({ merchantId }).lean();
    const totalExpected = allSettlements.reduce((s, st) => s + st.expectedAmount, 0);
    const totalActual = allSettlements.filter(s => s.actualAmount !== null).reduce((s, st) => s + st.actualAmount, 0);
    const totalVariance = allSettlements.reduce((s, st) => s + Math.abs(st.variance), 0);
    const exceptionCount = allSettlements.filter(s => s.status === 'exception').length;

    res.json({
      success: true,
      data: {
        settlements,
        summary: { totalExpected, totalActual, totalVariance, exceptionCount, total },
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getReconciliation = async (req, res, next) => {
  try {
    const merchantId = MERCHANT_ID;
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { merchantId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Reconciliation.countDocuments(filter);
    const reconciliations = await Reconciliation.find(filter).sort('-createdAt').skip(skip).limit(parseInt(limit)).lean();

    const allRecon = await Reconciliation.find({ merchantId }).lean();
    const matched = allRecon.filter(r => r.status === 'matched').length;
    const exceptions = allRecon.filter(r => r.status === 'exception').length;
    const totalVariance = allRecon.reduce((s, r) => s + Math.abs(r.variance), 0);

    res.json({
      success: true,
      data: {
        reconciliations,
        summary: { matched, exceptions, totalVariance, total: allRecon.length },
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.investigateReconciliation = async (req, res, next) => {
  try {
    const reconciliation = await Reconciliation.findOne({
      $or: [
        { reconciliationId: req.params.id },
        { paymentId: req.params.id },
      ]
    }).lean();

    if (!reconciliation) {
      return res.status(404).json({ success: false, error: 'Reconciliation record not found' });
    }

    const settlement = await Settlement.findOne({ settlementId: reconciliation.settlementId }).lean();

    res.json({
      success: true,
      data: {
        reconciliation,
        settlement,
        investigation: reconciliation.investigation,
      },
    });
  } catch (error) {
    next(error);
  }
};
