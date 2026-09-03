import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function RecoverySimulatorModal({ payment, isOpen, onClose, onActionCompleted }) {
  const [loading, setLoading] = useState(false);
  const [optionsData, setOptionsData] = useState(null);
  const [selectedAction, setSelectedAction] = useState('offer_upi');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && payment) {
      setExecutionResult(null);
      loadOptions();
    }
  }, [isOpen, payment]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const res = await api.getRecoveryOptions(payment.paymentId);
      setOptionsData(res.data);
      if (res.data?.recommended?.action) {
        setSelectedAction(res.data.recommended.action);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !payment) return null;

  const isHighRiskBlocked = payment.status === 'blocked' || payment.riskScore > 75;

  const handleExecute = async (actionToRun) => {
    setIsExecuting(true);
    try {
      const action = actionToRun || selectedAction;
      const res = await api.executeRecovery(payment.paymentId, action);
      setExecutionResult(res.data);
      addToast(`Action executed: ${payment.paymentId} recovered successfully!`, 'success');
      if (onActionCompleted) {
        onActionCompleted({ paymentId: payment.paymentId, action, status: 'recovered' });
      }
    } catch (err) {
      addToast('Error executing recovery action', 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-pulse-border overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0B214A] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3395FF]/20 flex items-center justify-center border border-[#3395FF]/40 text-[#3395FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pulse Recovery Simulator</h2>
              <p className="text-xs text-slate-300">
                Evaluating expected safe revenue vs friction for #{payment.paymentId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Payment Context Header Card */}
          <div className="bg-[#F7F9FC] rounded-xl p-4 border border-pulse-border flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-pulse-textSecondary font-medium">Failed Transaction</div>
              <div className="text-xl font-bold text-pulse-textPrimary">{formatCurrency(payment.amount)}</div>
              <div className="text-xs text-slate-600 mt-0.5">
                Customer: <span className="font-semibold text-slate-800">{payment.customerName}</span> • Via {payment.method?.toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-pulse-textSecondary">Failure Reason</div>
                <div className="text-xs font-semibold text-rose-600 capitalize">
                  {payment.failureReason ? payment.failureReason.replace(/_/g, ' ') : 'Issuer decline'}
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                payment.riskScore <= 20 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : payment.riskScore <= 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                Risk: {payment.riskScore}%
              </div>
            </div>
          </div>

          {/* Execution Result Banner (After Action) */}
          {executionResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-950 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
                <CheckCircle2 className="w-5 h-5" />
                Payment Recovered Successfully!
              </div>
              <p className="text-xs text-emerald-800">
                Action executed: <span className="font-semibold">{executionResult.action?.replace(/_/g, ' ').toUpperCase()}</span>. The transaction has transitioned to <span className="font-bold">RECOVERED ✓</span> and automated settlement tracking has initiated.
              </p>
              {executionResult.revenueImpact && (
                <div className="bg-white/80 rounded-lg p-3 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Incremental Realized Revenue: </span>
                    <span className="font-bold text-emerald-700 text-sm">{formatCurrency(executionResult.revenueImpact.incrementalImpact)}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 italic">
                    {executionResult.revenueImpact.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Risk Aware Recovery Block Notice */}
          {isHighRiskBlocked && !executionResult && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-950 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-rose-800">PULSE DECISION: RECOVERY BLOCKED</div>
                <div className="text-xs text-rose-700 mt-1">
                  High recovery probability ({payment.recoveryProbability}%) does <span className="font-bold underline">not</span> mean safe recovery. This transaction's risk score ({payment.riskScore}%) exceeds the merchant's safety threshold of 30%.
                </div>
                <div className="mt-2 text-xs font-semibold text-rose-900 bg-rose-100/70 inline-block px-2.5 py-1 rounded">
                  Policy: STOP automated recovery to prevent chargeback loss
                </div>
              </div>
            </div>
          )}

          {/* Options Comparison Table */}
          {!isHighRiskBlocked && !executionResult && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-pulse-textPrimary uppercase tracking-wider">
                  Simulated Recovery Strategies
                </div>
                <span className="text-[11px] text-pulse-textSecondary">Ranked by Safe Expected Value</span>
              </div>

              <div className="space-y-2.5">
                {optionsData?.options?.map((option) => {
                  const isRec = option.isRecommended;
                  const isSelected = selectedAction === option.action;

                  return (
                    <div
                      key={option.action}
                      onClick={() => setSelectedAction(option.action)}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                        isRec
                          ? 'border-[#3395FF] bg-[#E8F3FF]/30 ring-1 ring-[#3395FF]/40'
                          : isSelected
                          ? 'border-slate-400 bg-white'
                          : 'border-pulse-border bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => setSelectedAction(option.action)}
                            className="text-[#3395FF] focus:ring-[#3395FF]"
                          />
                          <span className="text-sm font-bold text-pulse-textPrimary">
                            {option.label || option.action.replace(/_/g, ' ')}
                          </span>
                          {isRec && (
                            <span className="bg-[#3395FF] text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                              Pulse Recommends
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-700">
                            {formatCurrency(option.expectedRevenue)}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {option.predictedProbability}% probability
                          </div>
                        </div>
                      </div>

                      {/* Reasoning note */}
                      {option.reasoning && (
                        <div className="mt-2 pl-6 text-xs text-slate-600 italic">
                          "{option.reasoning}"
                        </div>
                      )}

                      {/* Metric chips */}
                      <div className="mt-2.5 pl-6 flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Friction: <span className="font-semibold text-slate-700">{formatCurrency(option.estimatedFriction)}</span></span>
                        <span>Risk penalty: <span className="font-semibold text-slate-700">{option.risk}%</span></span>
                        <span>Confidence: <span className="font-semibold text-slate-700">{option.confidence || 88}%</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* "What if I do nothing?" Section */}
          {!executionResult && optionsData?.doNothing && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  What happens if I do nothing?
                </span>
                <span className="text-rose-600 font-bold">
                  Lost Revenue: {formatCurrency(optionsData.doNothing.expectedLostRevenue)}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Customer natural return rate for this merchant is only {optionsData.doNothing.recoveryRate}%. Without Pulse intervention, approximately {formatCurrency(optionsData.doNothing.expectedLostRevenue)} will permanently leak.
              </p>
            </div>
          )}

          {/* Evidence Checklist */}
          {optionsData?.whyThisPayment?.reasons?.length > 0 && !executionResult && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-pulse-textPrimary uppercase tracking-wider">
                Evidence & Verification Signals
              </div>
              <div className="bg-[#F7F9FC] rounded-xl p-3 border border-pulse-border space-y-1.5 text-xs text-slate-700">
                {optionsData.whyThisPayment.reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-pulse-border flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary text-xs"
          >
            {executionResult ? 'Close' : 'Cancel'}
          </button>

          {!executionResult && !isHighRiskBlocked && (
            <div className="flex items-center gap-2">
              <button
                disabled={isExecuting}
                onClick={() => handleExecute(selectedAction)}
                className="btn-primary text-xs"
              >
                {isExecuting ? (
                  'Executing Recovery...'
                ) : (
                  <>
                    <span>Execute Recommended Action ({selectedAction.replace(/_/g, ' ').toUpperCase()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {isHighRiskBlocked && !executionResult && (
            <button
              onClick={() => {
                addToast('Payment flagged for Manual Compliance Review.', 'warning');
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700"
            >
              Confirm Fraud Hold
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
