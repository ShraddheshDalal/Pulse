import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Activity,
  CreditCard,
  Clock,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Percent
} from 'lucide-react';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { api } from '../services/api';
import RecoverySimulatorModal from '../components/recovery/RecoverySimulatorModal';
import PaymentDrawer from '../components/payment/PaymentDrawer';

export default function OverviewPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSimulatorPayment, setActiveSimulatorPayment] = useState(null);
  const [drawerPaymentId, setDrawerPaymentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard();
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const health = dashboardData?.paymentHealth || {
    totalVolume: 4820000,
    capturedVolume: 4370000,
    recoverableVolume: 266000,
    recoveredVolume: 214000,
    revenueAtRisk: 140000,
    aiUplift: 131000,
  };

  const attentionItems = dashboardData?.attentionItems || [];

  return (
    <div className="space-y-6">
      
      {/* Payment Control Center Top Banner */}
      <div className="bg-white rounded-2xl border border-pulse-border p-5 sm:p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8F3FF] text-[#3395FF] border border-[#CFE5FF]">
                Payment Control Center
              </span>
              <span className="text-xs text-pulse-textSecondary">
                Live monitoring 2,000 payment journeys
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A] mt-1.5">
              "Know what happened. Decide what to do. Let Pulse handle the rest."
            </h2>
            <p className="text-xs text-pulse-textSecondary mt-1">
              Pulse follows the journey of every rupee from initial checkout attempt through risk checks, recovery, bank settlement, and reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboard}
              className="p-2 rounded-lg border border-pulse-border text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/attention')}
              className="btn-primary text-xs"
            >
              <span>Open Attention Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section: YOUR PAYMENT HEALTH */}
      <div className="bg-[#0B214A] rounded-2xl text-white p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3395FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3395FF]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Today's Payment Health
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Last reconciled: Just now
            </span>
          </div>

          {/* Core Business Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            {/* Payment Volume */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="text-[11px] text-slate-400 font-medium">Payment Volume</span>
              <div className="text-xl font-extrabold text-white mt-1">
                {formatCompactCurrency(health.totalVolume)}
              </div>
              <span className="text-[10px] text-slate-400">Total attempted GMV</span>
            </div>

            {/* Captured */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="text-[11px] text-emerald-400 font-medium">Captured</span>
              <div className="text-xl font-extrabold text-white mt-1">
                {formatCompactCurrency(health.capturedVolume)}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                {Math.round((health.capturedVolume / health.totalVolume) * 100)}% capture rate
              </span>
            </div>

            {/* Potentially Recoverable */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="text-[11px] text-amber-400 font-medium">Potentially Recoverable</span>
              <div className="text-xl font-extrabold text-amber-400 mt-1">
                {formatCompactCurrency(health.recoverableVolume)}
              </div>
              <span className="text-[10px] text-slate-400">Active recoverable failures</span>
            </div>

            {/* Recovered by Pulse */}
            <div className="bg-[#3395FF]/10 rounded-xl p-3.5 border border-[#3395FF]/30">
              <span className="text-[11px] text-[#3395FF] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recovered by Pulse
              </span>
              <div className="text-xl font-extrabold text-white mt-1">
                {formatCompactCurrency(health.recoveredVolume)}
              </div>
              <span className="text-[10px] text-[#3395FF] font-semibold">184 payments saved</span>
            </div>

            {/* Revenue at Risk */}
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/10">
              <span className="text-[11px] text-rose-400 font-medium">Revenue at Risk</span>
              <div className="text-xl font-extrabold text-rose-400 mt-1">
                {formatCompactCurrency(health.revenueAtRisk)}
              </div>
              <span className="text-[10px] text-slate-400">High risk or low recovery</span>
            </div>

            {/* AI-attributed Uplift */}
            <div className="bg-indigo-950/60 rounded-xl p-3.5 border border-indigo-500/30">
              <span className="text-[11px] text-indigo-300 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                AI Attributed Uplift
              </span>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                +{formatCompactCurrency(health.aiUplift)}
              </div>
              <span className="text-[10px] text-indigo-300">Modelled incremental</span>
            </div>

          </div>
        </div>
      </div>

      {/* ATTENTION REQUIRED — Clickable Priority Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-pulse-textPrimary flex items-center gap-2">
              <span>ATTENTION REQUIRED</span>
              <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full border border-rose-200">
                Action Prioritized
              </span>
            </h3>
            <p className="text-xs text-pulse-textSecondary">
              Issues prioritized by highest safe recoverable revenue. Click any card to take action.
            </p>
          </div>
          <button
            onClick={() => navigate('/attention')}
            className="text-xs font-bold text-pulse-blue hover:underline flex items-center gap-1"
          >
            <span>View all in Attention Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: 4 High-Risk Payments */}
          <div
            onClick={() => {
              setDrawerPaymentId('PAY48292');
            }}
            className="cursor-pointer bg-white rounded-xl p-4 border border-rose-200 hover:border-rose-400 hover:shadow-cardHover transition-all relative overflow-hidden group"
          >
            <div className="w-1.5 h-full bg-rose-500 absolute left-0 top-0" />
            <div className="pl-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  🔴 High-Risk Holds
                </span>
                <span className="text-[11px] font-bold text-slate-800">₹71,000</span>
              </div>
              <div className="text-sm font-extrabold text-pulse-textPrimary">
                4 high-risk payments
              </div>
              <p className="text-xs text-slate-500">
                Auto-recovery blocked. Critical risk markers exceed safety thresholds.
              </p>
              <div className="pt-2 flex items-center text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
                <span>Inspect #PAY48292 (₹85K)</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </div>

          {/* Card 2: 23 Recoverable Failed Payments */}
          <div
            onClick={() => {
              setActiveSimulatorPayment({
                paymentId: 'PAY48291',
                amount: 7499,
                customerName: 'Rahul Sharma',
                failureReason: 'issuer_decline',
                method: 'card',
                riskScore: 4,
                recoveryProbability: 81,
                status: 'recovery_recommended',
              });
            }}
            className="cursor-pointer bg-white rounded-xl p-4 border border-amber-200 hover:border-amber-400 hover:shadow-cardHover transition-all relative overflow-hidden group"
          >
            <div className="w-1.5 h-full bg-amber-500 absolute left-0 top-0" />
            <div className="pl-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  🟡 Immediate Recovery
                </span>
                <span className="text-[11px] font-bold text-slate-800">₹84,200</span>
              </div>
              <div className="text-sm font-extrabold text-pulse-textPrimary">
                23 recoverable failures
              </div>
              <p className="text-xs text-slate-500">
                Temporary issuer declines with high customer intent. UPI routing recommended.
              </p>
              <div className="pt-2 flex items-center text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform">
                <span>Simulate #PAY48291 (₹7,499)</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </div>

          {/* Card 3: ₹42,800 Settlement Variance */}
          <div
            onClick={() => navigate('/settlements')}
            className="cursor-pointer bg-white rounded-xl p-4 border border-amber-200 hover:border-amber-400 hover:shadow-cardHover transition-all relative overflow-hidden group"
          >
            <div className="w-1.5 h-full bg-amber-500 absolute left-0 top-0" />
            <div className="pl-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  🟡 Settlement Trace
                </span>
                <span className="text-[11px] font-bold text-slate-800">7 Exceptions</span>
              </div>
              <div className="text-sm font-extrabold text-pulse-textPrimary">
                ₹42,800 variance detected
              </div>
              <p className="text-xs text-slate-500">
                Expected payout discrepancy flagged in processor nodal adjustment ledger.
              </p>
              <div className="pt-2 flex items-center text-xs font-semibold text-amber-700 group-hover:translate-x-1 transition-transform">
                <span>Investigate Discrepancy</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </div>

          {/* Card 4: ₹2.14L Recovered Automatically */}
          <div
            onClick={() => navigate('/autopilot')}
            className="cursor-pointer bg-white rounded-xl p-4 border border-emerald-200 hover:border-emerald-400 hover:shadow-cardHover transition-all relative overflow-hidden group"
          >
            <div className="w-1.5 h-full bg-emerald-500 absolute left-0 top-0" />
            <div className="pl-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  🟢 Autopilot Success
                </span>
                <span className="text-[11px] font-bold text-emerald-700">89% Precision</span>
              </div>
              <div className="text-sm font-extrabold text-pulse-textPrimary">
                ₹2.14L recovered auto
              </div>
              <p className="text-xs text-slate-500">
                Executed under Balanced Autopilot policy without customer friction.
              </p>
              <div className="pt-2 flex items-center text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>View AI Action Log</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hero Showcase: The Unified Payment Journey (How It Works) */}
      <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
              The Pulse Lifecycle: How Pulse Operates
            </h3>
            <p className="text-xs text-pulse-textSecondary mt-0.5">
              Every payment passes through 10 deterministic steps to maximize safe realized revenue
            </p>
          </div>
          <span className="bg-pulse-lightBlue text-pulse-blue font-bold text-xs px-2.5 py-1 rounded-md border border-pulse-blueBorder">
            Continuous Operational Loop
          </span>
        </div>

        {/* Operational Flow Diagram */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 text-center text-xs">
          {[
            { step: '1. Payment', sub: 'Initiated' },
            { step: '2. Understand', sub: 'Root Cause' },
            { step: '3. Assess Risk', sub: 'Fraud Signals' },
            { step: '4. Estimate Rec', sub: 'Playbook' },
            { step: '5. Best Action', sub: 'Max Safe Rev' },
            { step: '6. Execute', sub: 'Autopilot/User' },
            { step: '7. Result', sub: 'Recovered ✓' },
            { step: '8. Settlement', sub: 'Track Fees' },
            { step: '9. Reconcile', sub: 'Zero Variance' },
            { step: '10. Learn', sub: 'Update Rules' },
          ].map((item, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-pulse-border">
              <div className="font-bold text-slate-800 text-[11px]">{item.step}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Recovery Simulator Modal */}
      <RecoverySimulatorModal
        payment={activeSimulatorPayment}
        isOpen={Boolean(activeSimulatorPayment)}
        onClose={() => setActiveSimulatorPayment(null)}
        onActionCompleted={() => {
          loadDashboard();
        }}
      />

      {/* Payment Details Drawer */}
      <PaymentDrawer
        paymentId={drawerPaymentId}
        isOpen={Boolean(drawerPaymentId)}
        onClose={() => setDrawerPaymentId(null)}
        onSimulateRecovery={(p) => {
          setDrawerPaymentId(null);
          setActiveSimulatorPayment(p);
        }}
      />

    </div>
  );
}
