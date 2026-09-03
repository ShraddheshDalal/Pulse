import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  CreditCard,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusBadge, getRiskBadge } from '../utils/formatters';
import { api } from '../services/api';
import PaymentDrawer from '../components/payment/PaymentDrawer';
import RecoverySimulatorModal from '../components/recovery/RecoverySimulatorModal';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [simulatorPayment, setSimulatorPayment] = useState(null);

  useEffect(() => {
    loadPayments();
  }, [statusFilter, methodFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      if (search) params.search = search;

      const res = await api.getPayments(params);
      setPayments(res.data.payments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPayments();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            Payments Ledger
          </h2>
          <p className="text-xs text-pulse-textSecondary mt-0.5">
            Real-time transaction tracking with embedded risk assessment, recovery state, and settlement audit
          </p>
        </div>

        <button
          onClick={loadPayments}
          className="p-2 rounded-lg border border-pulse-border text-slate-500 hover:text-slate-800 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl border border-pulse-border p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Payment ID (e.g. PAY48291), Customer, or Order..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-pulse-border rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-pulse-border rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
          >
            <option value="">All Lifecycle States</option>
            <option value="captured">Captured</option>
            <option value="recovered">Recovered ✓</option>
            <option value="recovery_recommended">Recovery Recommended</option>
            <option value="failed">Failed</option>
            <option value="blocked">Blocked (High Risk)</option>
            <option value="settled">Settled</option>
            <option value="reconciled">Reconciled</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-pulse-border rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
          >
            <option value="">All Payment Methods</option>
            <option value="upi">UPI</option>
            <option value="card">Cards</option>
            <option value="netbanking">Netbanking</option>
            <option value="wallet">Wallets</option>
          </select>
        </div>

      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-pulse-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-pulse-border text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Recovery Prob.</th>
                <th className="py-3 px-4">Recommended Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pulse-border text-slate-700 font-medium">
              {payments.map((p) => {
                const statusBadge = getStatusBadge(p.status);
                const riskBadge = getRiskBadge(p.riskScore);

                return (
                  <tr
                    key={p.paymentId}
                    className="hover:bg-[#F7F9FC] transition-colors group cursor-pointer"
                    onClick={() => setSelectedPaymentId(p.paymentId)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-pulse-blue">
                      #{p.paymentId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.customerName || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400">{p.customerEmail || 'user@example.com'}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="py-3.5 px-4 uppercase font-bold text-slate-600 text-[11px]">
                      {p.method}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                        {statusBadge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${riskBadge.bg} ${riskBadge.text} ${riskBadge.border}`}>
                        {p.riskScore}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {p.recoveryProbability ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#3395FF] h-full rounded-full"
                              style={{ width: `${p.recoveryProbability}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{p.recoveryProbability}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {p.recommendedAction ? (
                        <span className="bg-[#EEF2FF] text-[#4F46E5] font-bold text-[10px] px-2 py-0.5 rounded-md border border-[#C7D2FE]">
                          {p.recommendedAction.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None (Captured)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {p.status !== 'captured' && p.status !== 'settled' && p.status !== 'reconciled' && p.status !== 'recovered' && (
                          <button
                            onClick={() => setSimulatorPayment(p)}
                            className="btn-subtle"
                          >
                            Simulate
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPaymentId(p.paymentId)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                          title="Open Money Journey"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && !loading && (
          <div className="p-8 text-center text-xs text-slate-500">
            No payment records matched the filter criteria.
          </div>
        )}
      </div>

      {/* Drawer */}
      <PaymentDrawer
        paymentId={selectedPaymentId}
        isOpen={Boolean(selectedPaymentId)}
        onClose={() => setSelectedPaymentId(null)}
        onSimulateRecovery={(p) => {
          setSelectedPaymentId(null);
          setSimulatorPayment(p);
        }}
      />

      {/* Simulator Modal */}
      <RecoverySimulatorModal
        payment={simulatorPayment}
        isOpen={Boolean(simulatorPayment)}
        onClose={() => setSimulatorPayment(null)}
        onActionCompleted={() => loadPayments()}
      />

    </div>
  );
}
