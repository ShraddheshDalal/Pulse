import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { api } from '../services/api';

export default function SettlementPage() {
  const [settlementData, setSettlementData] = useState(null);
  const [reconciliationData, setReconciliationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigatingId, setInvestigatingId] = useState('RECON48293');
  const [investigationResult, setInvestigationResult] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, rRes] = await Promise.all([
        api.getSettlements(),
        api.getReconciliation(),
      ]);
      setSettlementData(sRes.data);
      setReconciliationData(rRes.data);

      // Default load Hero 3 investigation
      handleInvestigate('RECON48293');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigate = async (reconId) => {
    setInvestigatingId(reconId);
    try {
      const res = await api.investigateReconciliation(reconId);
      setInvestigationResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const reconciliations = reconciliationData?.reconciliations || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            Settlement & Reconciliation
          </h2>
          <span className="bg-amber-50 text-amber-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-amber-200">
            Nodal Ledger Audit
          </span>
        </div>
        <p className="text-xs text-pulse-textSecondary mt-1">
          Tracking the final leg of money: Expected vs Actual bank settlements, fee deductions, GST, and AI-assisted discrepancy investigations.
        </p>
      </div>

      {/* Hero 3 Feature: AI RECONCILIATION INVESTIGATION */}
      {investigationResult && (
        <div className="bg-[#0B214A] rounded-2xl text-white p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#3395FF]" />
              <h3 className="text-base font-extrabold text-white">
                AI RECONCILIATION INVESTIGATION — #{investigatingId}
              </h3>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Confidence: {investigationResult.investigation?.confidence || 92}%
            </span>
          </div>

          {/* Expected vs Actual Comparison Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Expected Settlement</span>
              <div className="text-xl font-extrabold text-white mt-1">
                {formatCurrency(investigationResult.settlement?.expectedAmount || 9112)}
              </div>
              <span className="text-[10px] text-slate-400">Gross ₹9,500 − Fees ₹190 − GST ₹34</span>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <span className="text-xs text-slate-400 font-medium">Actual Bank Credit</span>
              <div className="text-xl font-extrabold text-slate-300 mt-1">
                {formatCurrency(investigationResult.settlement?.actualAmount || 8712)}
              </div>
              <span className="text-[10px] text-slate-400">Credited to HDFC merchant account</span>
            </div>

            <div className="bg-amber-950/50 rounded-xl p-4 border border-amber-500/40">
              <span className="text-xs text-amber-300 font-bold">Unreconciled Variance</span>
              <div className="text-xl font-extrabold text-amber-400 mt-1">
                {formatCurrency(investigationResult.reconciliation?.variance || 400)}
              </div>
              <span className="text-[10px] text-amber-300 font-medium">Requires resolution</span>
            </div>
          </div>

          {/* AI Ledger Trace Pipeline */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Automated Root-Cause Trace
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {investigationResult.investigation?.evidence?.map((ev, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    ev.status === 'match'
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {ev.status === 'match' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>{ev.step}</span>
                  </div>
                  <p className="text-[11px] opacity-80">{ev.detail}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-400">Likely Cause: </span>
                <span className="font-bold text-amber-300">
                  {investigationResult.investigation?.likelyCause || 'Settlement adjustment by payment processor'}
                </span>
              </div>
              <div className="text-slate-300 italic text-[11px]">
                Recommendation: {investigationResult.investigation?.recommendation || 'Review adjustment with Razorpay support'}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Settlements Table */}
      <div className="bg-white rounded-2xl border border-pulse-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
            Reconciliation Exceptions & Audits
          </h3>
          <span className="text-xs text-slate-500">
            {reconciliations.length} entries in settlement ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-pulse-border text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Reconciliation ID</th>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Actual</th>
                <th className="py-3 px-4">Variance</th>
                <th className="py-3 px-4">Variance Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pulse-border font-medium">
              {reconciliations.map((r) => (
                <tr key={r.reconciliationId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {r.reconciliationId}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-pulse-blue font-bold">
                    #{r.paymentId}
                  </td>
                  <td className="py-3.5 px-4">{formatCurrency(r.expectedAmount)}</td>
                  <td className="py-3.5 px-4">{formatCurrency(r.actualAmount)}</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${r.variance === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {r.variance === 0 ? '₹0' : formatCurrency(r.variance)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 capitalize">
                    {r.varianceType.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      r.status === 'matched'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {r.status === 'matched' ? 'Reconciled ✓' : 'Exception'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleInvestigate(r.reconciliationId)}
                      className="btn-subtle text-[11px]"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
