import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, ArrowRight,
  Shield, CreditCard, Clock, Activity, FileText
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusBadge, getRiskBadge } from '../../utils/formatters';
import { api } from '../../services/api';

export default function PaymentDrawer({ paymentId, isOpen, onClose, onSimulateRecovery, onAskPulse }) {
  const [loading, setLoading] = useState(false);
  const [journeyData, setJourneyData] = useState(null);
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    if (isOpen && paymentId) {
      loadPaymentDetails();
    }
  }, [isOpen, paymentId]);

  const loadPaymentDetails = async () => {
    setLoading(true);
    try {
      const [journeyRes, healthRes] = await Promise.all([
        api.getPaymentJourney(paymentId),
        api.getPaymentHealth(paymentId),
      ]);
      setJourneyData(journeyRes.data);
      setHealthData(healthRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const payment = journeyData?.payment;
  const statusBadge = payment ? getStatusBadge(payment.status) : null;
  const riskBadge = payment ? getRiskBadge(payment.riskScore) : null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-pulse-border animate-in slide-in-from-right duration-200">

        {/* Drawer Header */}
        <div className="p-5 border-b border-pulse-border flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pulse-lightBlue text-pulse-blue flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-pulse-textPrimary">
                  {payment?.paymentId || paymentId}
                </span>
                {statusBadge && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                    {statusBadge.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-pulse-textSecondary">
                Customer: <span className="font-semibold text-slate-700">{payment?.customerName || 'Rahul Sharma'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F7F9FC] p-3 rounded-xl border border-pulse-border">
              <span className="text-[11px] text-pulse-textSecondary font-medium">Amount</span>
              <div className="text-lg font-bold text-pulse-textPrimary mt-0.5">
                {payment ? formatCurrency(payment.amount) : '—'}
              </div>
              <span className="text-[10px] text-slate-500 uppercase">{payment?.method || 'UPI'}</span>
            </div>

            <div className="bg-[#F7F9FC] p-3 rounded-xl border border-pulse-border">
              <span className="text-[11px] text-pulse-textSecondary font-medium">Risk Score</span>
              <div className="text-lg font-bold text-pulse-textPrimary mt-0.5">
                {payment?.riskScore !== undefined ? `${payment.riskScore}%` : '—'}
              </div>
              {riskBadge && (
                <span className={`text-[10px] font-semibold ${riskBadge.text}`}>{riskBadge.label}</span>
              )}
            </div>

            <div className="bg-[#F7F9FC] p-3 rounded-xl border border-pulse-border">
              <span className="text-[11px] text-pulse-textSecondary font-medium">Recovery Pot.</span>
              <div className="text-lg font-bold text-pulse-blue mt-0.5">
                {payment?.recoveryProbability !== undefined ? `${payment.recoveryProbability}%` : '—'}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                {payment?.recoveryProbability > 50 ? 'High Chance' : 'Low Chance'}
              </span>
            </div>
          </div>

          {/* Payment Health Breakdown (78/100) */}
          <div className="bg-white rounded-xl border border-pulse-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-pulse-blue" />
                <span className="text-xs font-bold text-pulse-textPrimary uppercase tracking-wider">
                  Payment Health Index
                </span>
              </div>
              <span className="text-base font-extrabold text-pulse-textPrimary">
                {healthData?.healthScore || payment?.healthScore || 78} / 100
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Legitimacy Confidence</span>
                  <span className="font-semibold text-slate-800">{healthData?.breakdown?.legitimacy || 96}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${healthData?.breakdown?.legitimacy || 96}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Customer Purchase Intent</span>
                  <span className="font-semibold text-slate-800">{healthData?.breakdown?.customerIntent || 89}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pulse-blue rounded-full" style={{ width: `${healthData?.breakdown?.customerIntent || 89}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Recovery Likelihood</span>
                  <span className="font-semibold text-slate-800">{healthData?.breakdown?.recoveryPotential || payment?.recoveryProbability || 81}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${healthData?.breakdown?.recoveryPotential || 81}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>Settlement Confidence</span>
                  <span className="font-semibold text-slate-800">{healthData?.breakdown?.settlementConfidence || 98}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${healthData?.breakdown?.settlementConfidence || 98}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Decision & Recommendation Card */}
          {payment?.aiReasoning && (
            <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-indigo-950 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pulse-aiAccent" />
                  Why Pulse Recommended {payment.recommendedAction ? payment.recommendedAction.replace(/_/g, ' ').toUpperCase() : 'ACTION'}
                </span>
                <span className="bg-white text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-indigo-200">
                  AI DECISION
                </span>
              </div>
              <p className="text-indigo-900 leading-relaxed">
                {payment.aiReasoning}
              </p>

              {payment.aiEvidence && (
                <div className="space-y-1 pt-1">
                  {payment.aiEvidence.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-indigo-800 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Money Journey Lifecycle Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-pulse-textPrimary uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-pulse-blue" />
                Money Journey Timeline
              </span>
              <span className="text-[11px] text-pulse-textSecondary">Real-time ledger events</span>
            </div>

            <div className="relative pl-5 space-y-4 border-l-2 border-slate-200 ml-2">
              {journeyData?.timeline?.map((step, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline bullet icon */}
                  <div className={`absolute -left-[27px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    step.type === 'success'
                      ? 'bg-emerald-500 text-white'
                      : step.type === 'error'
                      ? 'bg-rose-500 text-white'
                      : step.type === 'warning'
                      ? 'bg-amber-500 text-white'
                      : step.type === 'ai'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-pulse-blue text-white'
                  }`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pulse-textPrimary">{step.event}</span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(step.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Action Bar */}
        <div className="p-4 border-t border-pulse-border bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => onAskPulse && onAskPulse(`Why did payment #${payment?.paymentId} fail and what is the best recovery?`)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-pulse-aiAccent" />
            Ask Pulse
          </button>

          {payment?.status !== 'recovered' && payment?.status !== 'settled' && payment?.status !== 'reconciled' && (
            <button
              onClick={() => onSimulateRecovery && onSimulateRecovery(payment)}
              className="btn-primary text-xs"
            >
              <span>Launch Recovery Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
