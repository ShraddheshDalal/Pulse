function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompactCurrency(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}

function getRiskLevel(score) {
  if (score <= 20) return 'low';
  if (score <= 50) return 'medium';
  if (score <= 75) return 'high';
  return 'critical';
}

function getStatusLabel(status) {
  const labels = {
    initiated: 'Initiated',
    processing: 'Processing',
    captured: 'Captured',
    failed: 'Failed',
    at_risk: 'At Risk',
    recovery_recommended: 'Recovery Recommended',
    recovery_in_progress: 'Recovery In Progress',
    recovered: 'Recovered',
    settled: 'Settled',
    reconciled: 'Reconciled',
    refunded: 'Refunded',
    blocked: 'Blocked',
    review_required: 'Review Required',
    abandoned: 'Abandoned',
  };
  return labels[status] || status;
}

function getActionLabel(action) {
  const labels = {
    retry_same_method: 'Retry Same Method',
    offer_upi: 'Offer UPI',
    offer_card: 'Offer Card',
    send_payment_link: 'Send Payment Link',
    retry_later: 'Retry Later',
    manual_review: 'Manual Review',
    block: 'Block Recovery',
  };
  return labels[action] || action;
}

const MERCHANT_ID = process.env.MERCHANT_ID || 'MERCHANT_TRENDCART_001';

module.exports = { formatCurrency, formatCompactCurrency, getRiskLevel, getStatusLabel, getActionLabel, MERCHANT_ID };
