import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Sliders,
  Sparkles,
  ArrowRight,
  Clock,
  RefreshCw,
  Save
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';

export default function AutopilotPage() {
  const [autopilotData, setAutopilotData] = useState(null);
  const [mode, setMode] = useState('balanced');
  const [settings, setSettings] = useState({
    maxAutoActionAmount: 25000,
    riskThreshold: 30,
    recoveryProbabilityThreshold: 60,
    manualReviewThreshold: 50000,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadAutopilot();
  }, []);

  const loadAutopilot = async () => {
    setLoading(true);
    try {
      const res = await api.getAutopilot();
      setAutopilotData(res.data);
      if (res.data.mode) setMode(res.data.mode);
      if (res.data.settings) setSettings(res.data.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.updateAutopilot(mode, settings);
      addToast(`Autopilot policy updated to ${mode.toUpperCase()}`, 'success');
    } catch (e) {
      addToast('Failed to update autopilot settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const recentActions = autopilotData?.recentActions || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
              AI Autopilot Operations
            </h2>
            <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-indigo-200">
              Autonomous Governance
            </span>
          </div>
          <p className="text-xs text-pulse-textSecondary mt-1">
            Configure how aggressively Pulse acts on payment failures. All actions maintain an auditable ledger record.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary text-xs flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving Policy...' : 'Save Policy'}</span>
        </button>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Conservative */}
        <div
          onClick={() => setMode('conservative')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            mode === 'conservative'
              ? 'bg-white border-[#3395FF] ring-2 ring-[#3395FF]/30 shadow-card'
              : 'bg-white border-pulse-border hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mode 1
            </span>
            {mode === 'conservative' && (
              <span className="bg-[#3395FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <h3 className="text-base font-extrabold text-[#0B214A]">Conservative</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            AI recommends actions; merchant explicitly approves every single execution. Recommended during onboarding.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
            0% automated executions
          </div>
        </div>

        {/* Balanced (Default) */}
        <div
          onClick={() => setMode('balanced')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            mode === 'balanced'
              ? 'bg-white border-[#3395FF] ring-2 ring-[#3395FF]/30 shadow-card'
              : 'bg-white border-pulse-border hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#3395FF] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Recommended (Default)
            </span>
            {mode === 'balanced' && (
              <span className="bg-[#3395FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <h3 className="text-base font-extrabold text-[#0B214A]">Balanced</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            AI automatically handles low-risk, high-confidence recoverable transactions under ₹25K. Medium and high risk require human review.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-600">
            89% precision • High safety
          </div>
        </div>

        {/* Autonomous */}
        <div
          onClick={() => setMode('autonomous')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all ${
            mode === 'autonomous'
              ? 'bg-white border-[#3395FF] ring-2 ring-[#3395FF]/30 shadow-card'
              : 'bg-white border-pulse-border hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mode 3
            </span>
            {mode === 'autonomous' && (
              <span className="bg-[#3395FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <h3 className="text-base font-extrabold text-[#0B214A]">Autonomous</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Pulse auto-executes all recoverable actions up to risk threshold. Only critical transactions (&gt;₹50K) trigger human pause.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-indigo-600">
            Maximum velocity & GMV recovery
          </div>
        </div>

      </div>

      {/* Threshold Sliders */}
      <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-5">
        <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
          Safety Guardrail Thresholds
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Max Auto-Action Amount */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Maximum Auto-Action Amount</span>
              <span className="font-bold text-[#3395FF]">{formatCurrency(settings.maxAutoActionAmount)}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={settings.maxAutoActionAmount}
              onChange={(e) => setSettings({ ...settings, maxAutoActionAmount: Number(e.target.value) })}
              className="w-full accent-[#3395FF]"
            />
            <p className="text-[11px] text-slate-500">
              Transactions above this value will pause for one-click merchant review.
            </p>
          </div>

          {/* Auto-Recovery Risk Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Maximum Risk Score Allowed for Auto-Action</span>
              <span className="font-bold text-rose-600">{settings.riskThreshold}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={settings.riskThreshold}
              onChange={(e) => setSettings({ ...settings, riskThreshold: Number(e.target.value) })}
              className="w-full accent-[#3395FF]"
            />
            <p className="text-[11px] text-slate-500">
              If fraud risk exceeds {settings.riskThreshold}%, Pulse automatically suppresses autonomous retry.
            </p>
          </div>

          {/* Recovery Probability Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Minimum Recovery Probability Threshold</span>
              <span className="font-bold text-emerald-600">{settings.recoveryProbabilityThreshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={settings.recoveryProbabilityThreshold}
              onChange={(e) => setSettings({ ...settings, recoveryProbabilityThreshold: Number(e.target.value) })}
              className="w-full accent-[#3395FF]"
            />
            <p className="text-[11px] text-slate-500">
              Requires at least {settings.recoveryProbabilityThreshold}% statistical recovery confidence before action.
            </p>
          </div>

          {/* Manual Review Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between font-semibold text-slate-700">
              <span>Mandatory Manual Review Threshold</span>
              <span className="font-bold text-slate-900">{formatCurrency(settings.manualReviewThreshold)}</span>
            </div>
            <input
              type="range"
              min="25000"
              max="150000"
              step="5000"
              value={settings.manualReviewThreshold}
              onChange={(e) => setSettings({ ...settings, manualReviewThreshold: Number(e.target.value) })}
              className="w-full accent-[#3395FF]"
            />
            <p className="text-[11px] text-slate-500">
              Absolute circuit breaker limit. High value transactions always require dual authorization.
            </p>
          </div>

        </div>
      </div>

      {/* AI Action Log (FINTECH AUDIT TRAIL) */}
      <div className="bg-white rounded-2xl border border-pulse-border shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
              Live AI Action Log (Audit Trail)
            </h3>
            <p className="text-xs text-pulse-textSecondary mt-0.5">
              Every autonomous decision is permanently recorded with inputs, confidence, and financial outcome
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
            Compliance Grade
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-pulse-border text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Decision / Action</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">Recovery Prob.</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pulse-border font-medium text-slate-700">
              {recentActions.map((act) => (
                <tr key={act.auditId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                    {act.auditId}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-pulse-blue">
                    #{act.paymentId}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {act.action?.replace(/_/g, ' ').toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      act.riskScore <= 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {act.riskScore}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    {act.recoveryProbability}%
                  </td>
                  <td className="py-3.5 px-4 capitalize font-semibold text-slate-600">
                    {act.executedBy || 'Autopilot'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      act.result === 'success'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {act.result === 'success' ? 'Recovered ✓' : 'Blocked ✕'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs truncate" title={act.reason}>
                    {act.reason}
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
