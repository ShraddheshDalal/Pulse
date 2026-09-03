import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { api } from '../services/api';
import PaymentDrawer from '../components/payment/PaymentDrawer';

export default function RiskPage() {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerPaymentId, setDrawerPaymentId] = useState(null);

  useEffect(() => {
    loadRiskSummary();
  }, []);

  const loadRiskSummary = async () => {
    setLoading(true);
    try {
      const res = await api.getRiskSummary();
      setRiskData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const summary = riskData?.summary || {
    totalHighRisk: 18,
    highRiskVolume: 71000,
    criticalCount: 4,
    blockedRecovery: 85000,
    worthInvestigating: 3,
    worthInvestigatingAmount: 12400,
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            Risk That Affects Revenue
          </h2>
          <span className="bg-rose-50 text-rose-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-rose-200">
            Safety Guardrails
          </span>
        </div>
        <p className="text-xs text-pulse-textSecondary mt-1">
          Pulse balances recovery potential with fraud exposure. Never maximize transactions blindly at the cost of chargebacks.
        </p>
      </div>

      {/* Hero Insight Banner */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-5 text-rose-950 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              Core Risk Engine Thesis
            </span>
            <div className="text-sm font-extrabold text-rose-900 mt-0.5">
              {riskData?.insight || '₹71,000 is high-risk, but only ₹12,400 is worth further investigation.'}
            </div>
          </div>
        </div>

        <div className="text-xs font-bold text-rose-800 bg-white/80 px-3.5 py-2 rounded-lg border border-rose-200">
          Pulse Protected: ₹85,000 prevented chargebacks
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fintech-card p-4">
          <span className="text-xs text-pulse-textSecondary font-medium">High-Risk Payment Volume</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">
            {formatCurrency(summary.highRiskVolume)}
          </div>
          <span className="text-[10px] text-slate-500">{summary.totalHighRisk} transactions flagged</span>
        </div>

        <div className="fintech-card p-4">
          <span className="text-xs text-pulse-textSecondary font-medium">Blocked Recoveries</span>
          <div className="text-xl font-extrabold text-slate-800 mt-1">
            {formatCurrency(summary.blockedRecovery)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Auto-recovery withheld</span>
        </div>

        <div className="fintech-card p-4">
          <span className="text-xs text-pulse-textSecondary font-medium">Worth Investigation</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">
            {formatCurrency(summary.worthInvestigatingAmount)}
          </div>
          <span className="text-[10px] text-slate-500">{summary.worthInvestigating} borderline opportunities</span>
        </div>

        <div className="fintech-card p-4">
          <span className="text-xs text-pulse-textSecondary font-medium">False Positive Rate</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">
            1.2%
          </div>
          <span className="text-[10px] text-slate-500">Industry benchmark: 4.8%</span>
        </div>
      </div>

      {/* Hero 2: Risk-Aware Recovery Matrix Showcase */}
      <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-4">
        <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
          Risk-Aware Recovery Matrix
        </h3>
        <p className="text-xs text-pulse-textSecondary">
          Pulse classifies every payment along two independent axes: Recovery Potential vs Transaction Risk.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-xl text-center text-xs">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-600 block">Low Risk + Low Recovery</span>
            <div className="text-base font-extrabold text-amber-800 mt-1">WAIT</div>
            <p className="text-[11px] text-slate-600 mt-1">Delay retry by 45m to avoid irritating customer</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 ring-2 ring-emerald-500">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Low Risk + High Recovery</span>
            <div className="text-base font-extrabold text-emerald-800 mt-1">RECOVER ✓</div>
            <p className="text-[11px] text-slate-600 mt-1">Execute immediate alternative payment method</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">High Risk + Low Recovery</span>
            <div className="text-base font-extrabold text-rose-800 mt-1">STOP ✕</div>
            <p className="text-[11px] text-slate-600 mt-1">Zero recovery value with fraud liability</p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <span className="text-[10px] uppercase font-bold text-indigo-600 block">High Risk + High Recovery</span>
            <div className="text-base font-extrabold text-indigo-800 mt-1">VERIFY ⚠</div>
            <p className="text-[11px] text-slate-600 mt-1">Require human verification before processing</p>
          </div>
        </div>
      </div>

      {/* Flagged High-Risk Payments */}
      <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-4">
        <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
          Active High-Risk Cases
        </h3>

        {/* Hero Demo 2 Case: #PAY48292 */}
        <div
          onClick={() => setDrawerPaymentId('PAY48292')}
          className="cursor-pointer p-4 rounded-xl bg-slate-50 border border-rose-200 hover:border-rose-400 transition-all flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-pulse-textPrimary">₹85,000</span>
              <span className="font-mono font-bold text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                #PAY48292
              </span>
              <span className="text-xs bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px]">
                RECOVERY BLOCKED
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Customer: Unknown Buyer • Risk: <span className="font-bold text-rose-700">94% (Critical)</span> • Recovery Potential: 90%
            </p>
            <p className="text-xs text-rose-700 italic mt-1">
              "Pulse blocked recovery: High expected recovery does not outweigh estimated chargeback fraud exposure."
            </p>
          </div>

          <button className="btn-secondary text-xs flex items-center gap-1">
            <span>Inspect Risk Signals</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Payment Details Drawer */}
      <PaymentDrawer
        paymentId={drawerPaymentId}
        isOpen={Boolean(drawerPaymentId)}
        onClose={() => setDrawerPaymentId(null)}
      />

    </div>
  );
}
