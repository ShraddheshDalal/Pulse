import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { api } from '../services/api';

export default function PlaybookPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaybook();
  }, []);

  const loadPlaybook = async () => {
    setLoading(true);
    try {
      const res = await api.getPlaybook();
      setRules(res.data.rules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            Merchant Payment Playbook
          </h2>
          <span className="bg-indigo-50 text-indigo-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-indigo-200">
            Learned Operational Rules
          </span>
        </div>
        <p className="text-xs text-pulse-textSecondary mt-1">
          Pulse continuously learns which actions succeed for TrendCart India's specific customer demographic and banking routes.
        </p>
      </div>

      {/* Learning Loop Callout Banner */}
      <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl p-5 text-indigo-950 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
              Autonomous Optimization Feedback Loop
            </span>
            <div className="text-sm font-extrabold text-indigo-900 mt-0.5">
              Prediction → Action → Settlement Result → Update Playbook Confidence
            </div>
          </div>
        </div>

        <div className="text-xs font-bold text-indigo-800 bg-white/80 px-3.5 py-2 rounded-lg border border-indigo-200">
          Pulse has learned from 184 completed recoveries
        </div>
      </div>

      {/* Playbook Rules Table/List */}
      <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
            Active Decision Rules
          </h3>
          <span className="text-xs text-slate-500">
            {rules.length} calibrated rules
          </span>
        </div>

        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.playbookId}
              className="p-4 rounded-xl bg-slate-50 border border-pulse-border hover:border-slate-300 transition-colors flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {rule.playbookId}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {rule.scenario}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Optimal Action:</span>
                  <span className="font-bold text-pulse-blue bg-[#E8F3FF] px-2 py-0.5 rounded border border-[#CFE5FF]">
                    {rule.recommendedAction?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                  <span>Sample Size: <strong className="text-slate-700">n={rule.sampleSize}</strong></span>
                  <span>Avg Amount: <strong className="text-slate-700">{formatCurrency(rule.averageRecoveryAmount || 3200)}</strong></span>
                  <span>Last updated: {rule.lastUpdated || 'Recently'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-700">
                    {rule.successRate}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Success Rate</span>
                </div>

                <div className="text-right pl-3 border-l border-slate-200">
                  <div className="text-lg font-extrabold text-indigo-700">
                    {rule.confidence}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Confidence</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
