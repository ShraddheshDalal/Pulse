import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { api } from '../services/api';
import RecoverySimulatorModal from '../components/recovery/RecoverySimulatorModal';
import PaymentDrawer from '../components/payment/PaymentDrawer';
import { useToast } from '../components/common/Toast';

export default function AttentionPage() {
  const [attentionData, setAttentionData] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'act_now', 'review', 'monitor', 'resolved'
  const [loading, setLoading] = useState(true);
  const [simulatorPayment, setSimulatorPayment] = useState(null);
  const [drawerPaymentId, setDrawerPaymentId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    loadAttention();
  }, []);

  const loadAttention = async () => {
    setLoading(true);
    try {
      const res = await api.getAttentionItems();
      setAttentionData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const actNowList = attentionData?.actNow || [];
  const reviewList = attentionData?.review || [];
  const monitorList = attentionData?.monitor || [];
  const resolvedList = attentionData?.resolved || [];

  const handleQuickApprove = async (payment) => {
    try {
      const action = payment.recommendedAction || 'offer_upi';
      await api.executeRecovery(payment.paymentId, action);
      addToast(`Approved & Executed: #${payment.paymentId} recovered via ${action.replace(/_/g, ' ').toUpperCase()}`, 'success');
      loadAttention();
    } catch (e) {
      addToast('Execution failed', 'error');
    }
  };

  const renderCard = (item, badgeType) => {
    const isBlocked = item.status === 'blocked' || item.riskScore > 75;
    const isRecovered = item.status === 'recovered';

    return (
      <div
        key={item.paymentId}
        className="bg-white rounded-xl border border-pulse-border p-5 shadow-card hover:border-slate-300 transition-all space-y-4"
      >
        {/* Card Header: Amount, ID, Status */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-pulse-textPrimary">
                {formatCurrency(item.amount)}
              </span>
              <span className="text-xs font-mono font-bold text-pulse-blue bg-pulse-lightBlue px-2 py-0.5 rounded">
                #{item.paymentId}
              </span>
              <span className="text-xs text-slate-500">• {item.customerName}</span>
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-2">
              <span>{item.what}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 uppercase text-[10px]">{item.method}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              isBlocked
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isRecovered
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : item.riskScore <= 20
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isBlocked ? 'Risk: 94% (Critical)' : `Risk: ${item.riskScore}%`}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
              Recovery: {item.recoveryProbability}%
            </span>
          </div>
        </div>

        {/* 4-Part Attention Framework: WHAT, WHY, IMPACT, RECOMMENDED ACTION */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#F7F9FC] rounded-xl p-3.5 border border-pulse-border text-xs">
          
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              What Happened
            </span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {item.failureReason ? item.failureReason.replace(/_/g, ' ') : 'Payment held for audit'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Likely Cause / Why
            </span>
            <span className="text-slate-700 mt-0.5 block">
              {item.why || 'Temporary bank gateway decline'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Impact
            </span>
            <span className="font-bold text-rose-600 mt-0.5 block">
              {item.impact || formatCurrency(item.amount)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Pulse Recommends
            </span>
            <span className="font-bold text-pulse-blue mt-0.5 block">
              {item.recommendedActionLabel || 'REVIEW'}
            </span>
          </div>

        </div>

        {/* Explanation footnote */}
        {item.aiReasoning && (
          <div className="text-xs text-slate-600 bg-white border border-slate-100 p-2.5 rounded-lg flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-pulse-aiAccent shrink-0 mt-0.5" />
            <span className="italic leading-relaxed">"{item.aiReasoning}"</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={() => setDrawerPaymentId(item.paymentId)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>Inspect Money Journey</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            {!isRecovered && !isBlocked && (
              <>
                <button
                  onClick={() => setSimulatorPayment(item)}
                  className="btn-secondary text-xs py-1.5"
                >
                  <span>Simulate Options</span>
                </button>
                <button
                  onClick={() => handleQuickApprove(item)}
                  className="btn-primary text-xs py-1.5"
                >
                  <span>Approve ({item.recommendedAction ? item.recommendedAction.replace(/_/g, ' ').toUpperCase() : 'UPI'})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {isBlocked && (
              <button
                onClick={() => setSimulatorPayment(item)}
                className="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100"
              >
                Review Fraud Reason
              </button>
            )}

            {isRecovered && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Recovered & Captured ✓
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
              Attention Workspace
            </h2>
            <span className="bg-rose-50 text-rose-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-rose-200">
              Merchant Task Queue
            </span>
          </div>
          <p className="text-xs text-pulse-textSecondary mt-1">
            "What needs my attention right now?" — Ranked by safe expected recoverable value, not arbitrary timestamp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAttention}
            className="p-2 rounded-lg border border-pulse-border text-slate-500 hover:text-slate-800 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-pulse-border pb-3 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'all'
              ? 'bg-[#0B214A] text-white'
              : 'bg-white text-slate-600 border border-pulse-border hover:bg-slate-50'
          }`}
        >
          All Items ({actNowList.length + reviewList.length + monitorList.length})
        </button>
        <button
          onClick={() => setActiveTab('act_now')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'act_now'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          ACT NOW ({actNowList.length})
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'review'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          REVIEW ({reviewList.length})
        </button>
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'monitor'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          MONITOR ({monitorList.length})
        </button>
        <button
          onClick={() => setActiveTab('resolved')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'resolved'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          RESOLVED ({resolvedList.length})
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-8">
        
        {/* ACT NOW SECTION */}
        {(activeTab === 'all' || activeTab === 'act_now') && actNowList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
                  ACT NOW — High Urgency & Immediate Safe Recovery
                </h3>
              </div>
              <span className="text-xs text-rose-600 font-bold">
                {formatCurrency(attentionData?.summary?.actNowAmount || 0)} at stake
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {actNowList.map(item => renderCard(item, 'act_now'))}
            </div>
          </div>
        )}

        {/* REVIEW SECTION */}
        {(activeTab === 'all' || activeTab === 'review') && reviewList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
                  REVIEW — Settlement Discrepancies & Limit Checks
                </h3>
              </div>
              <span className="text-xs text-amber-700 font-bold">
                {formatCurrency(attentionData?.summary?.reviewAmount || 0)}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {reviewList.map(item => renderCard(item, 'review'))}
            </div>
          </div>
        )}

        {/* MONITOR SECTION */}
        {(activeTab === 'all' || activeTab === 'monitor') && monitorList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
                MONITOR — In-flight Retries & Network Delays
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {monitorList.map(item => renderCard(item, 'monitor'))}
            </div>
          </div>
        )}

        {/* RESOLVED SECTION */}
        {(activeTab === 'all' || activeTab === 'resolved') && resolvedList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
                RESOLVED — Successfully Recovered & Reconciled
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {resolvedList.map(item => renderCard(item, 'resolved'))}
            </div>
          </div>
        )}

      </div>

      {/* Simulator Modal */}
      <RecoverySimulatorModal
        payment={simulatorPayment}
        isOpen={Boolean(simulatorPayment)}
        onClose={() => setSimulatorPayment(null)}
        onActionCompleted={() => loadAttention()}
      />

      {/* Payment Drawer */}
      <PaymentDrawer
        paymentId={drawerPaymentId}
        isOpen={Boolean(drawerPaymentId)}
        onClose={() => setDrawerPaymentId(null)}
        onSimulateRecovery={(p) => {
          setDrawerPaymentId(null);
          setSimulatorPayment(p);
        }}
      />

    </div>
  );
}
