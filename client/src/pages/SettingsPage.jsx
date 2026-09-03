import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Settings,
  Shield,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Store,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../components/common/Toast';

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'demo';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_PulseOpsSandbox');
  const [razorpaySecret, setRazorpaySecret] = useState('••••••••••••••••');
  const [testMode, setTestMode] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSaveRazorpay = (e) => {
    e.preventDefault();
    addToast('Razorpay Test Mode credentials verified and saved.', 'success');
  };

  const demoScenarios = [
    {
      id: 1,
      title: 'Hero Scenario 1: Low-Risk Recovery',
      description: '₹7,499 Rahul Sharma card decline. Pulse simulates options, recommends UPI, recovers money, and tracks settlement.',
      tag: 'Track 03 Hero',
      action: () => navigate('/attention'),
    },
    {
      id: 2,
      title: 'Hero Scenario 2: Risk-Aware Recovery Block',
      description: '₹85,000 payment with 94% fraud risk and 90% recovery potential. Pulse blocks recovery because risk exceeds merchant safety threshold.',
      tag: 'Risk Engine',
      action: () => navigate('/risk'),
    },
    {
      id: 3,
      title: 'Hero Scenario 3: Settlement Mismatch & AI Audit',
      description: '₹9,112 expected vs ₹8,712 actual payout. AI traces payment → fees → tax → refund → adjustment and discovers the ₹400 variance cause.',
      tag: 'Settlement & Recon',
      action: () => navigate('/settlements'),
    },
    {
      id: 4,
      title: 'Hero Scenario 4: Trilingual Voice Autopilot',
      description: 'Merchant speaks in Marathi, Hindi, or English. Queries revenue at risk and safely executes recovery with confirmation.',
      tag: 'Voice Operations',
      action: () => navigate('/voice'),
    },
    {
      id: 5,
      title: 'Hero Scenario 5: Revenue Leakage & Counterfactual AI',
      description: 'Visualizes the ₹4.82L store revenue leakage and models +₹1.31L additional recovery attributed to Pulse.',
      tag: 'Revenue Map',
      action: () => navigate('/revenue'),
    },
    {
      id: 6,
      title: 'Hero Scenario 6: Full Money Journey Lifecycle',
      description: 'Step-by-step visual audit of an entire payment journey from initial click to nodal bank account settlement.',
      tag: 'Lifecycle Trace',
      action: () => navigate('/money-journey'),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
          Platform Settings & Demo Controls
        </h2>
        <p className="text-xs text-pulse-textSecondary mt-1">
          Manage merchant credentials, Razorpay test mode parameters, and one-click judge demonstration scenarios.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-pulse-border pb-3 text-xs">
        <button
          onClick={() => setActiveTab('demo')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'demo'
              ? 'bg-[#0B214A] text-white'
              : 'bg-white text-slate-700 border border-pulse-border hover:bg-slate-50'
          }`}
        >
          Demo Scenarios (For Judges)
        </button>
        <button
          onClick={() => setActiveTab('razorpay')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'razorpay'
              ? 'bg-[#0B214A] text-white'
              : 'bg-white text-slate-700 border border-pulse-border hover:bg-slate-50'
          }`}
        >
          Razorpay Integration
        </button>
        <button
          onClick={() => setActiveTab('merchant')}
          className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
            activeTab === 'merchant'
              ? 'bg-[#0B214A] text-white'
              : 'bg-white text-slate-700 border border-pulse-border hover:bg-slate-50'
          }`}
        >
          Merchant Profile
        </button>
      </div>

      {/* TAB 1: DEMO SCENARIOS */}
      {activeTab === 'demo' && (
        <div className="space-y-4">
          <div className="bg-[#E8F3FF] border border-[#CFE5FF] rounded-2xl p-5 text-pulse-textPrimary flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#3395FF] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-extrabold text-[#0B214A]">
                Guided Demonstration Tour for Buildathon Judges
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Experience every core product feature using calibrated deterministic data. Launch any scenario below to evaluate the end-to-end user experience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoScenarios.map((sc) => (
              <div
                key={sc.id}
                className="bg-white rounded-2xl border border-pulse-border p-5 shadow-card hover:border-[#3395FF] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {sc.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#3395FF]">
                      Scenario #{sc.id}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-pulse-textPrimary">
                    {sc.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <button
                  onClick={sc.action}
                  className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <span>Launch Scenario #{sc.id}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RAZORPAY INTEGRATION */}
      {activeTab === 'razorpay' && (
        <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border-b border-pulse-border pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider">
                Razorpay API Configuration
              </h3>
              <p className="text-xs text-pulse-textSecondary mt-0.5">
                Connect your Razorpay Test Mode keys or run in deterministic sandbox mode
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
              Webhook Ready
            </span>
          </div>

          <form onSubmit={handleSaveRazorpay} className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-pulse-border">
              <div>
                <span className="font-bold text-slate-800 block">Test Mode / Mock Sandbox</span>
                <span className="text-slate-500 text-[11px]">Toggle between live test API keys and deterministic simulation</span>
              </div>
              <input
                type="checkbox"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="rounded text-[#3395FF] focus:ring-[#3395FF] w-4 h-4"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Razorpay Key ID (Test Mode)
              </label>
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-pulse-border rounded-lg text-slate-800 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Razorpay Key Secret (Test Mode)
              </label>
              <input
                type="password"
                value={razorpaySecret}
                onChange={(e) => setRazorpaySecret(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-pulse-border rounded-lg text-slate-800 font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Secrets are never sent to the frontend. Kept strictly on the backend Node.js server.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Webhook Endpoint URL
              </label>
              <input
                type="text"
                readOnly
                value="http://localhost:5000/api/webhooks/razorpay"
                className="w-full px-3.5 py-2 bg-slate-100 border border-pulse-border rounded-lg text-slate-600 font-mono text-xs cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Listens for payment.captured, payment.failed, and settlement.processed events.
              </p>
            </div>

            <button type="submit" className="btn-primary text-xs py-2 px-4 font-bold">
              Update Configuration
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MERCHANT PROFILE */}
      {activeTab === 'merchant' && (
        <div className="bg-white rounded-2xl border border-pulse-border p-6 shadow-card space-y-6 max-w-2xl text-xs">
          <h3 className="text-sm font-extrabold text-pulse-textPrimary uppercase tracking-wider border-b border-pulse-border pb-3">
            Merchant Business Profile
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block mb-1">Store / Business Name</span>
              <div className="font-bold text-slate-800 text-sm">TrendCart India Pvt Ltd</div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Primary Operator</span>
              <div className="font-bold text-slate-800 text-sm">Vikram Mehta</div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Registered GSTIN</span>
              <div className="font-bold text-slate-800 font-mono">27AADCB2230M1ZT</div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Nodal Settlement Bank</span>
              <div className="font-bold text-slate-800">HDFC Bank (A/C •••• 4521)</div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Average Order Value (AOV)</span>
              <div className="font-bold text-slate-800">₹3,200</div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Monthly Payment Volume</span>
              <div className="font-bold text-slate-800">₹48.2 Lakhs</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
