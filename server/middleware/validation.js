function validatePaymentId(req, res, next) {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid payment ID' });
  }
  next();
}

function validatePagination(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
}

module.exports = { validatePaymentId, validatePagination };
