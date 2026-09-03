import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('vikram@trendcart.in');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Top Brand Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3395FF] text-white font-black text-2xl shadow-lg mb-3">
          P
        </div>
        <h1 className="text-2xl font-extrabold text-[#0B214A] tracking-tight">
          PULSE
        </h1>
        <p className="text-xs uppercase tracking-widest font-bold text-[#3395FF] mt-0.5">
          AI Payment Operations Autopilot
        </p>
        <p className="mt-2 text-sm text-pulse-textSecondary">
          "Know what happened. Decide what to do. Let Pulse handle the rest."
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-pulse-border sm:px-10 space-y-6">
          
          {/* Quick Demo Merchant Shortcut */}
          <div className="bg-[#E8F3FF] border border-[#CFE5FF] rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B214A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#3395FF]" />
                Demo Merchant Environment
              </span>
              <span className="bg-[#3395FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Ready
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Preloaded with 2,000 payment lifecycles, failed transactions, risk signals, and settlement exceptions for TrendCart India.
            </p>
            <button
              onClick={() => navigate('/overview')}
              className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <span>Continue with Demo Merchant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-4 text-[11px] text-slate-400 uppercase font-semibold">
              Or Sign In with Credentials
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-pulse-textPrimary mb-1">
                Merchant Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-pulse-border rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-pulse-textPrimary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-pulse-border rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#3395FF] focus:ring-[#3395FF]" />
                <span>Remember this terminal</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#3395FF] hover:underline">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="w-full btn-secondary text-xs py-2.5 font-bold">
              Sign In to Pulse
            </button>
          </form>

          {/* Security note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>256-Bit Bank Grade Encryption • Razorpay Standard</span>
          </div>

        </div>
      </div>
    </div>
  );
}
