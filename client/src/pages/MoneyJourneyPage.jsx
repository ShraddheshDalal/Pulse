import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { formatCurrency, formatDateTime, getStatusBadge } from '../utils/formatters';
import { api } from '../services/api';
import RecoverySimulatorModal from '../components/recovery/RecoverySimulatorModal';

export default function MoneyJourneyPage() {
  const [selectedPaymentId, setSelectedPaymentId] = useState('PAY48291');
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulatorPayment, setSimulatorPayment] = useState(null);

  const demoJourneys = [
    { id: 'PAY48291', amount: 7499, title: '₹7,499 Card Decline → Recovered via UPI', status: 'recovery_recommended' },
    { id: 'PAY48292', amount: 85000, title: '₹85,000 High-Risk Fraud Attempt → Blocked', status: 'blocked' },
    { id: 'PAY48293', amount: 9500, title: '₹9,500 Captured → ₹400 Settlement Variance', status: 'reconciled' },
  ];

  useEffect(() => {
    loadJourney(selectedPaymentId);
  }, [selectedPaymentId]);

  const loadJourney = async (id) => {
    setLoading(true);
    try {
      const res = await api.getPaymentJourney(id);
      setJourneyData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const payment = journeyData?.payment;
  const statusBadge = payment ? getStatusBadge(payment.status) : null;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            The Money Journey
          </h2>
          <span className="bg-pulse-lightBlue text-pulse-blue font-bold text-xs px-2.5 py-0.5 rounded-full border border-pulse-blueBorder">
            Unified Lifecycle
          </span>
        </div>
        <p className="text-xs text-pulse-textSecondary mt-1">
          "Where did my money go?" — A single unbroken chronological trace from initial customer checkout to final bank deposit and reconciliation.
        </p>
      </div>

      {/* Preset Journey Selector */}
      <div className="flex flex-wrap gap-3">
        {demoJourneys.map((j) => (
          <button
            key={j.id}
            onClick={() => setSelectedPaymentId(j.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              selectedPaymentId === j.id
                ? 'bg-[#0B214A] text-white border-[#0B214A] shadow-md'
                : 'bg-white text-slate-700 border-pulse-border hover:bg-slate-50'
            }`}
          >
            {j.title}
          </button>
        ))}
      </div>

      {/* Main Lifecycle View Card */}
      <div className="bg-white rounded-2xl border border-pulse-border shadow-card p-6 space-y-6">
        
        {/* Payment Headline Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-pulse-border pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl font-extrabold text-pulse-textPrimary">
                {payment ? formatCurrency(payment.amount) : '—'}
              </span>
              <span className="font-mono text-xs font-bold text-pulse-blue bg-[#E8F3FF] px-2 py-0.5 rounded border border-[#CFE5FF]">
                #{payment?.paymentId}
              </span>
              {statusBadge && (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                  {statusBadge.label}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customer: <span className="font-semibold text-slate-800">{payment?.customerName}</span> ({payment?.customerEmail}) • Initial Method: {payment?.method?.toUpperCase()}
            </p>
          </div>

          {payment?.status !== 'recovered' && payment?.status !== 'settled' && payment?.status !== 'reconciled' && (
            <button
              onClick={() => setSimulatorPayment(payment)}
              className="btn-primary text-xs"
            >
              <span>Simulate Recovery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Timeline Visualization */}
        <div className="relative pl-6 space-y-6 border-l-2 border-[#CFE5FF] ml-3">
          {journeyData?.timeline?.map((step, idx) => {
            const isSuccess = step.type === 'success';
            const isError = step.type === 'error';
            const isWarning = step.type === 'warning';
            const isAi = step.type === 'ai';

            return (
              <div key={idx} className="relative group">
                
                {/* Node circle */}
                <div className={`absolute -left-[33px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                  isSuccess
                    ? 'bg-emerald-500 text-white'
                    : isError
                    ? 'bg-rose-500 text-white'
                    : isWarning
                    ? 'bg-amber-500 text-white'
                    : isAi
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#3395FF] text-white'
                }`}>
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>

                <div className="bg-slate-50 border border-pulse-border rounded-xl p-4 space-y-1 hover:border-slate-300 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-pulse-textPrimary flex items-center gap-1.5">
                      {isAi && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                      {step.event}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateTime(step.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.detail}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Recovery Simulator Modal */}
      <RecoverySimulatorModal
        payment={simulatorPayment}
        isOpen={Boolean(simulatorPayment)}
        onClose={() => setSimulatorPayment(null)}
        onActionCompleted={() => loadJourney(selectedPaymentId)}
      />

    </div>
  );
}
