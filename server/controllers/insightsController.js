const AIInsight = require('../models/AIInsight');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getInsights = async (req, res, next) => {
  try {
    const insights = await AIInsight.find({ merchantId: MERCHANT_ID }).sort('-priority').lean();
    res.json({ success: true, data: { insights } });
  } catch (error) {
    next(error);
  }
};
