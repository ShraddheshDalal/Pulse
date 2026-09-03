import React, { useState } from 'react';
import { X, Sparkles, Send, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export default function AskPulseModal({ isOpen, onClose, initialQuery = '', contextPage = 'Dashboard' }) {
  const [query, setQuery] = useState(initialQuery);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAsk = async (qText) => {
    const textToAsk = qText || query;
    if (!textToAsk.trim()) return;
    setLoading(true);
    setAnswer('');

    try {
      const res = await api.sendVoiceCommand(textToAsk, 'en');
      setAnswer(res.data.response);
    } catch (e) {
      setAnswer('Unable to analyze right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestionsByPage = {
    Overview: ['What should I handle first today?', 'How much revenue is recoverable?'],
    Attention: ['Why is the ₹14,000 payment ranked #1?', 'Why is recovery blocked for the ₹85,000 payment?'],
    Payments: ['Why did payment #PAY48291 fail?', 'Show all high-risk payments'],
    Settlement: ['Where did the ₹400 variance go?', 'Show settlement exceptions'],
    Revenue: ['Where is our store revenue leaking most?', 'Explain counterfactual AI uplift'],
  };

  const suggestions = suggestionsByPage[contextPage] || suggestionsByPage.Overview;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-pulse-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#0B214A] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5]/30 text-[#818CF8] flex items-center justify-center border border-[#4F46E5]/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Ask Pulse</h3>
              <p className="text-[11px] text-slate-300">Contextual payment intelligence ({contextPage})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* Query Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Why did this payment fail? Where did the ₹400 go?"
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-pulse-border rounded-xl text-xs text-pulse-textPrimary focus:outline-none focus:ring-2 focus:ring-[#3395FF] focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary text-xs px-3.5 py-2.5"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Context suggestions */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Suggested for {contextPage}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(s);
                    handleAsk(s);
                  }}
                  className="text-[11px] px-2.5 py-1 bg-[#F7F9FC] border border-pulse-border text-slate-700 hover:border-[#3395FF] hover:bg-[#E8F3FF] rounded-lg transition-colors text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Answer Card */}
          {answer && (
            <div className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl p-4 text-xs space-y-2">
              <span className="text-[10px] font-bold text-pulse-aiAccent uppercase tracking-wider block">
                Pulse Decision Explanation
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">{answer}</p>
            </div>
          )}

          {loading && (
            <div className="p-4 text-center text-xs text-slate-500 italic">
              Pulse is analyzing payment operational ledger...
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-pulse-border text-right">
          <button onClick={onClose} className="btn-secondary text-xs">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
