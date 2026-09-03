import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { api } from '../../services/api';
import { useToast } from '../common/Toast';

export default function VoiceOverlay({ onActionExecuted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToast();

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    voiceService.setLanguage(lang);
  };

  const startVoice = () => {
    setIsOpen(true);
    setTranscript('');
    setResponse('');
    setPendingConfirmation(null);

    voiceService.setLanguage(selectedLanguage);
    voiceService.startListening({
      onStart: () => setIsListening(true),
      onResult: (text) => {
        setIsListening(false);
        setTranscript(text);
        processVoiceCommand(text, selectedLanguage);
      },
      onError: (err) => {
        setIsListening(false);
        setResponse(`Microphone note: ${err}. You can also click the quick commands below.`);
      },
      onEnd: () => setIsListening(false),
    });
  };

  const stopVoice = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const processVoiceCommand = async (text, lang) => {
    setIsProcessing(true);
    try {
      const res = await api.sendVoiceCommand(text, lang);
      const data = res.data;
      setResponse(data.response);
      voiceService.speak(data.response);

      if (data.requiresConfirmation) {
        setPendingConfirmation(data);
      }
    } catch (e) {
      setResponse('Unable to reach voice processor. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation) return;
    setIsProcessing(true);
    try {
      // Execute the recommended recovery for the hero payment
      const res = await api.executeRecovery('PAY48291', 'offer_upi');
      addToast('Voice Autopilot: ₹7,499 recovered via UPI!', 'success');
      setResponse('Confirmation received. Recovery executed successfully. Transaction is now Recovered ✓.');
      voiceService.speak('Recovery executed successfully.');
      setPendingConfirmation(null);
      if (onActionExecuted) {
        onActionExecuted(res.data);
      }
    } catch (err) {
      addToast('Action failed to execute', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPrompts = [
    { label: 'Revenue at risk?', text: 'How much revenue is at risk today?', lang: 'en' },
    { label: 'हिंदी: कितने payment fail हुए?', text: 'आज कितने payment fail हुए?', lang: 'hi' },
    { label: 'मराठी: आज किती payment fail झाले?', text: 'आज किती payment fail झाले?', lang: 'mr' },
    { label: 'Priority recovery?', text: 'Which payment needs attention first?', lang: 'en' },
    { label: 'Recover payment (Action)', text: 'Recover the recommended payment.', lang: 'en' },
  ];

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              stopVoice();
            } else {
              startVoice();
            }
          }}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#0B214A] hover:bg-[#081C3A] text-white rounded-full shadow-lg border border-slate-700 hover:border-[#3395FF] transition-all transform hover:scale-105 group"
        >
          <div className="w-6 h-6 rounded-full bg-[#3395FF] flex items-center justify-center text-white">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-wide">Talk to Pulse</span>
          <span className="text-[10px] bg-white/20 text-slate-200 px-1.5 py-0.5 rounded font-semibold uppercase">
            EN • HI • MR
          </span>
        </button>
      </div>

      {/* Voice Assistant Modal / Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-pulse-border overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#0B214A] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3395FF]/20 flex items-center justify-center text-[#3395FF] border border-[#3395FF]/30">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold">Pulse Voice Operations</h3>
                <p className="text-[10px] text-slate-300">Financial command interface</p>
              </div>
            </div>
            <button
              onClick={() => {
                stopVoice();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Language Selector Bar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-pulse-border flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Language:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedLanguage === 'en'
                    ? 'bg-[#3395FF] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedLanguage === 'hi'
                    ? 'bg-[#3395FF] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => handleLanguageChange('mr')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedLanguage === 'mr'
                    ? 'bg-[#3395FF] text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>

          {/* Assistant Activity Body */}
          <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto">

            {/* Listening status indicator */}
            <div className="flex items-center justify-center gap-3 py-2">
              <button
                onClick={isListening ? stopVoice : startVoice}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white pulse-radar'
                    : 'bg-[#E8F3FF] text-[#3395FF] hover:bg-[#d5ebff]'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="text-left">
                <div className="text-xs font-bold text-pulse-textPrimary">
                  {isListening ? 'Pulse is listening...' : 'Click mic to speak'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isListening ? `Listening in ${selectedLanguage.toUpperCase()}...` : 'Or tap a prompt below'}
                </div>
              </div>
            </div>

            {/* User Transcript */}
            {transcript && (
              <div className="bg-slate-50 border border-pulse-border rounded-xl p-3 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  You Said
                </span>
                <p className="text-slate-800 font-medium italic">"{transcript}"</p>
              </div>
            )}

            {/* Assistant Response */}
            {response && (
              <div className="bg-[#F0F7FF] border border-[#CFE5FF] rounded-xl p-3 text-xs space-y-1">
                <span className="text-[10px] text-[#3395FF] font-bold uppercase tracking-wider block">
                  Pulse Assistant
                </span>
                <p className="text-slate-800 leading-relaxed font-medium">{response}</p>
              </div>
            )}

            {/* Financial Action Confirmation Modal Inside Voice Assistant */}
            {pendingConfirmation && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Financial Action Confirmation Required
                </div>
                <p className="text-amber-900 text-[11px]">
                  Pulse will never execute financial operations without explicit merchant confirmation unless permitted under Autopilot rules.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    disabled={isProcessing}
                    onClick={handleConfirmAction}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm & Execute
                  </button>
                  <button
                    onClick={() => setPendingConfirmation(null)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded font-semibold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Quick Test Prompt Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Quick Commands
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(q.text);
                      setSelectedLanguage(q.lang);
                      processVoiceCommand(q.text, q.lang);
                    }}
                    className="text-[11px] px-2.5 py-1 bg-white border border-slate-200 hover:border-[#3395FF] hover:bg-[#F7F9FC] text-slate-700 rounded-lg text-left transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer note */}
          <div className="bg-slate-50 px-4 py-2 border-t border-pulse-border text-[10px] text-slate-400 flex items-center justify-between">
            <span>Powered by Pulse Intent Router</span>
            <span className="font-semibold text-slate-600">Zero External Paid APIs</span>
          </div>

        </div>
      )}
    </>
  );
}
