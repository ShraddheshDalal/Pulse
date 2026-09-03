import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ArrowRight,
  Filter
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';

export default function InsightsPage() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getInsights();
      setInsights(res.data.insights || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPolicy = (insight) => {
    addToast(`Automated Playbook updated: "${insight.recommendedAction}" applied!`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            Actionable Intelligence
          </h2>
          <span className="bg-pulse-lightBlue text-pulse-blue font-bold text-xs px-2.5 py-0.5 rounded-full border border-pulse-blueBorder">
            Derived from 2,000 Payments
          </span>
        </div>
        <p className="text-xs text-pulse-textSecondary mt-1">
          Evidence-based findings derived from your store's transaction outcomes. No generic AI statements.
        </p>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {insights.map((ins) => (
          <div
            key={ins.insightId}
            className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                  {ins.category || 'Recovery Strategy'}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {ins.confidence}% Confidence
                </span>
              </div>

              <h3 className="text-base font-extrabold text-pulse-textPrimary leading-snug">
                {ins.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ins.description}
              </p>

              {/* Evidence & Metrics Bar */}
              <div className="bg-[#F7F9FC] rounded-xl p-3.5 border border-pulse-border text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Sample Size: <strong className="text-slate-800">n={ins.sampleSize} payments</strong></span>
                  <span>Period: <strong className="text-slate-800">{ins.timePeriod || 'Last 30 days'}</strong></span>
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong>Evidence:</strong> {ins.evidence}
                </div>
              </div>
            </div>

            {/* Recommendation & CTA */}
            <div className="pt-2 border-t border-pulse-border space-y-3">
              <div className="text-xs text-pulse-blue font-semibold flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pulse-blue shrink-0 mt-0.5" />
                <span>Recommended: {ins.recommendedAction}</span>
              </div>

              <button
                onClick={() => handleApplyPolicy(ins)}
                className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5 font-bold"
              >
                <span>Adopt Rule into Playbook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
