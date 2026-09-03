import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  AlertOctagon,
  TrendingUp,
  ShieldCheck,
  GitBranch,
  Lightbulb,
  BookOpen,
  Cpu,
  Mic,
  Settings,
  Menu,
  X,
  Sparkles,
  Activity,
  CheckCircle2,
  ChevronRight,
  LogOut,
  SlidersHorizontal,
  Bell
} from 'lucide-react';
import { api } from '../services/api';
import VoiceOverlay from '../components/voice/VoiceOverlay';
import AskPulseModal from '../components/common/AskPulseModal';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ online: false, source: 'Connecting...' });
  const [autopilotMode, setAutopilotMode] = useState('balanced');
  const [askPulseOpen, setAskPulseOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkConnection();
    loadDashboardInfo();
  }, []);

  const checkConnection = async () => {
    const status = await api.checkStatus();
    setConnectionStatus(status);
  };

  const loadDashboardInfo = async () => {
    try {
      const res = await api.getDashboard();
      if (res.data?.merchant?.autopilotMode) {
        setAutopilotMode(res.data.merchant.autopilotMode);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Determine current page title for contextual Ask Pulse
  const getPageContext = () => {
    const p = location.pathname;
    if (p.includes('attention')) return 'Attention';
    if (p.includes('payments')) return 'Payments';
    if (p.includes('revenue')) return 'Revenue';
    if (p.includes('risk')) return 'Risk';
    if (p.includes('settlement')) return 'Settlement';
    if (p.includes('insights')) return 'Insights';
    if (p.includes('playbook')) return 'Playbook';
    if (p.includes('autopilot')) return 'Autopilot';
    return 'Overview';
  };

  const navItems = [
    { label: 'Overview', to: '/overview', icon: LayoutDashboard },
    { label: 'Payments', to: '/payments', icon: CreditCard },
    { label: 'Attention', to: '/attention', icon: AlertOctagon, badge: '27 Issues', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
    { label: 'Revenue', to: '/revenue', icon: TrendingUp },
    { label: 'Risk', to: '/risk', icon: ShieldCheck },
    { label: 'Money Journey', to: '/money-journey', icon: GitBranch },
    { label: 'Settlement & Recon', to: '/settlements', icon: Activity },
    { label: 'Insights', to: '/insights', icon: Lightbulb },
    { label: 'Merchant Playbook', to: '/playbook', icon: BookOpen },
    { label: 'Autopilot', to: '/autopilot', icon: Cpu, badge: 'Active', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Voice Assistant', to: '/voice', icon: Mic },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col md:flex-row text-pulse-textPrimary">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0B214A] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-black text-white text-base">
            P
          </div>
          <span className="font-extrabold tracking-wider text-base">PULSE</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#0B214A] text-white flex flex-col transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3395FF] flex items-center justify-center font-black text-white text-xl shadow-md">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-lg">PULSE</span>
                <span className="bg-[#3395FF]/30 text-[#3395FF] border border-[#3395FF]/40 text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded">
                  AI OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Payment Operations Autopilot
              </p>
            </div>
          </div>
        </div>

        {/* Merchant Quick Profile Card */}
        <div className="px-4 py-3 bg-[#081C3A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              VM
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">TrendCart India</div>
              <div className="text-[10px] text-slate-400">Vikram Mehta (Merchant)</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Store Active" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#3395FF] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Autopilot Status Indicator in Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-[#081C3A]/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Autopilot Engine</span>
            <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-1.5 py-0.5 rounded">
              {autopilotMode}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3395FF] animate-pulse" />
            <span>Scanning 2,000 payment lifecycles</span>
          </div>
        </div>

        {/* Logout / Reset Demo */}
        <div className="p-3 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400 hover:text-slate-200">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Switch Store</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono">v1.0.0</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Desktop Top Operational Bar */}
        <header className="bg-white border-b border-pulse-border px-6 py-3.5 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
          
          {/* Headline */}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-pulse-textPrimary flex items-center gap-2">
              <span>Good morning, Vikram</span>
              <span className="text-xs font-normal text-pulse-textSecondary hidden lg:inline">
                • Here's what needs your attention today
              </span>
            </h1>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center gap-3">
            
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-pulse-border rounded-lg text-xs font-medium text-slate-600">
              <span className={`w-2 h-2 rounded-full ${connectionStatus.online ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <span className="text-[11px]">{connectionStatus.source}</span>
            </div>

            {/* Contextual Ask Pulse Button */}
            <button
              onClick={() => setAskPulseOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#4F46E5] border border-[#C7D2FE] rounded-lg text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Pulse ({getPageContext()})</span>
            </button>

            {/* Demo Scenarios Quick Button */}
            <button
              onClick={() => navigate('/settings?tab=demo')}
              className="flex items-center gap-1 px-3 py-1.5 bg-pulse-lightBlue text-pulse-blue hover:bg-[#d4ebff] rounded-lg text-xs font-semibold transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Demo Scenarios</span>
            </button>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Global Voice Assistant Overlay */}
      <VoiceOverlay
        onActionExecuted={() => {
          // Re-check dashboard info
          loadDashboardInfo();
        }}
      />

      {/* Contextual Ask Pulse Modal */}
      <AskPulseModal
        isOpen={askPulseOpen}
        onClose={() => setAskPulseOpen(false)}
        contextPage={getPageContext()}
      />

    </div>
  );
}
