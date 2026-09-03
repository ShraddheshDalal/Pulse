export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount) {
  if (!amount || isNaN(amount)) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

export function getStatusBadge(status) {
  const map = {
    captured: { label: 'Captured', bg: 'bg-[#ECFDF3]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
    settled: { label: 'Settled', bg: 'bg-[#ECFDF3]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
    reconciled: { label: 'Reconciled ✓', bg: 'bg-[#ECFDF3]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
    recovered: { label: 'Recovered ✓', bg: 'bg-[#ECFDF3]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
    failed: { label: 'Failed', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#FECACA]' },
    blocked: { label: 'Recovery Blocked', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#FECACA]' },
    at_risk: { label: 'At Risk', bg: 'bg-[#FFF7E6]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
    recovery_recommended: { label: 'Recovery Recommended', bg: 'bg-[#EEF2FF]', text: 'text-[#4F46E5]', border: 'border-[#C7D2FE]' },
    recovery_in_progress: { label: 'Recovery In Progress', bg: 'bg-[#E8F3FF]', text: 'text-[#3395FF]', border: 'border-[#CFE5FF]' },
    abandoned: { label: 'Abandoned', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    review_required: { label: 'Review Required', bg: 'bg-[#FFF7E6]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
    initiated: { label: 'Initiated', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    processing: { label: 'Processing', bg: 'bg-[#E8F3FF]', text: 'text-[#3395FF]', border: 'border-[#CFE5FF]' },
  };
  return map[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
}

export function getRiskBadge(score) {
  if (score <= 20) return { label: 'Low Risk', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  if (score <= 50) return { label: 'Medium Risk', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
  if (score <= 75) return { label: 'High Risk', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
  return { label: 'Critical Risk', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
}
