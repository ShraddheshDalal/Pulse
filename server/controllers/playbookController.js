const MerchantPlaybook = require('../models/MerchantPlaybook');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getPlaybook = async (req, res, next) => {
  try {
    const rules = await MerchantPlaybook.find({ merchantId: MERCHANT_ID }).sort('-confidence').lean();
    res.json({ success: true, data: { rules } });
  } catch (error) {
    next(error);
  }
};
