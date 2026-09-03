const AuditLog = require('../models/AuditLog');
const { MERCHANT_ID } = require('../utils/helpers');

exports.getAuditLog = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments({ merchantId: MERCHANT_ID });
    const logs = await AuditLog.find({ merchantId: MERCHANT_ID })
      .sort('-timestamp')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        logs,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      },
    });
  } catch (error) {
    next(error);
  }
};
