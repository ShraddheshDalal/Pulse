import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { api } from '../services/api';

export default function RevenuePage() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const res = await api.getRecoverySummary();
      setSummaryData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const leakageData = [
    { name: 'Temporary Failures', amount: 174000, color: '#3395FF', recoverable: 'High (UPI Routing)' },
    { name: 'Cart Abandonment', amount: 92000, color: '#818CF8', recoverable: 'Med (Payment Links)' },
    { name: 'Risk Holds', amount: 71000, color: '#F87171', recoverable: 'Stop (Fraud Prevented)' },
    { name: 'Permanent Declines', amount: 63000, color: '#CBD5E1', recoverable: 'Low (Expired)' },
    { name: 'Unresolved', amount: 42000, color: '#FBBF24', recoverable: 'Delayed Retry' },
    { name: 'Settlement Variance', amount: 40000, color: '#FB923C', recoverable: 'Audit & Recon' },
  ];

  const counterfactualChannels = [
    { channel: 'Alternative Payment Routing (Cards → UPI)', amount: 71000, pct: '54%' },
    { channel: 'Smart Delay Retry Timing (Bank load clearance)', amount: 32000, pct: '24%' },
    { channel: 'High-Intent Cart Abandonment WhatsApp Links', amount: 19000, pct: '15%' },
    { channel: 'Subscription Auto-Retry Optimization', amount: 9000, pct: '7%' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            Revenue Intelligence & Leakage Map
          </h2>
          <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
            Track 03 Hero
          </span>
        </div>
        <p className="text-xs text-pulse-textSecondary mt-1">
          Tracking where revenue is leaking, what is realistically safe to recover, and modeled counterfactual AI uplift.
        </p>
      </div>

      {/* Hero 1: WOW FEATURE 3 — COUNTERFACTUAL REVENUE */}
      <div className="bg-[#0B214A] rounded-2xl text-white p-6 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#3395FF]" />
            <h3 className="text-base font-extrabold tracking-wide text-white">
              WHAT WOULD HAVE HAPPENED WITHOUT PULSE?
            </h3>
          </div>
          <span className="text-[11px] bg-white/10 text-slate-300 px-3 py-1 rounded-full border border-white/20 font-medium">
            Modelled / simulated financial impact
          </span>
        </div>

        {/* Counterfactual Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <span className="text-xs text-slate-400 font-medium">Total Attempted GMV</span>
            <div className="text-2xl font-extrabold text-white mt-1">₹48.2L</div>
            <span className="text-[10px] text-slate-400">Total transaction orders</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <span className="text-xs text-slate-400 font-medium">Baseline Recovery (No AI)</span>
            <div className="text-2xl font-extrabold text-slate-300 mt-1">₹0.83L</div>
            <span className="text-[10px] text-slate-400">Merchant natural return rate (19%)</span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <span className="text-xs text-[#3395FF] font-semibold">Actual Recovered by Pulse</span>
            <div className="text-2xl font-extrabold text-[#3395FF] mt-1">₹2.14L</div>
            <span className="text-[10px] text-slate-400">Safe realized payments</span>
          </div>

          <div className="bg-emerald-950/60 rounded-xl p-4 border border-emerald-500/40">
            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Additional AI-Attributed Uplift
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">+₹1.31L</div>
            <span className="text-[10px] text-emerald-300 font-medium">+158% incremental recovery</span>
          </div>
        </div>

        {/* Counterfactual Attribution Channels */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Attribution by AI Decision Strategy
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {counterfactualChannels.map((item, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs">
                <span className="text-slate-400 block text-[11px] h-8">{item.channel}</span>
                <div className="text-base font-extrabold text-white mt-1">{formatCurrency(item.amount)}</div>
                <span className="text-[10px] text-emerald-400 font-semibold">{item.pct} of total uplift</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hero 2: WOW FEATURE 2 — WHERE YOUR REVENUE IS LEAKING */}
      <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-pulse-blue" />
              <h3 className="text-base font-extrabold text-pulse-textPrimary uppercase tracking-wider">
                WHERE YOUR REVENUE IS LEAKING
              </h3>
            </div>
            <p className="text-xs text-pulse-textSecondary mt-0.5">
              Breakdown of total ₹4.82L potential revenue leakage across operational failure vectors
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Realistically Recoverable:</span>
            <span className="text-base font-extrabold text-emerald-700 ml-1.5">₹2.66L</span>
          </div>
        </div>

        {/* Chart + Category Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Bar Chart View */}
          <div className="lg:col-span-7 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leakageData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" tickFormatter={(v) => `₹${v / 1000}K`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, width: 130 }} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {leakageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cards Breakdown List */}
          <div className="lg:col-span-5 space-y-2.5">
            {leakageData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-pulse-border text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="font-bold text-slate-800 block">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{item.recoverable}</span>
                  </div>
                </div>
                <div className="text-right font-extrabold text-slate-900">
                  {formatCurrency(item.amount)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
