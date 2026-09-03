import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  HelpCircle,
  Globe
} from 'lucide-react';
import { voiceService } from '../services/voiceService';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';

export default function VoiceAssistantPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Good morning, Vikram. Pulse Voice Operations is active. You can query payments, recovery options, risk levels, or execute recovery in English, Hindi, or Marathi.',
      lang: 'en',
    },
  ]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    voiceService.setLanguage(lang);
  };

  const handleStartListening = () => {
    voiceService.setLanguage(selectedLanguage);
    voiceService.startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript) => {
        setIsListening(false);
        handleSendQuery(transcript, selectedLanguage);
      },
      onError: (err) => {
        setIsListening(false);
        addToast(`Mic error: ${err}. Try text input or allow mic permissions.`, 'warning');
      },
      onEnd: () => setIsListening(false),
    });
  };

  const handleStopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleSendQuery = async (queryText, lang = selectedLanguage) => {
    const text = queryText || inputText;
    if (!text.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text, lang };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.sendVoiceCommand(text, lang);
      const data = res.data;

      const assistantMsg = {
        sender: 'assistant',
        text: data.response,
        lang: data.detectedLanguage || lang,
        requiresConfirmation: data.requiresConfirmation,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      voiceService.speak(data.response);

      if (data.requiresConfirmation) {
        setPendingConfirmation(data);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Error connecting to Pulse Command Router. Please try again.', lang },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirmation) return;
    setLoading(true);
    try {
      await api.executeRecovery('PAY48291', 'offer_upi');
      addToast('Voice Autopilot: ₹7,499 recovered via UPI!', 'success');
      const confirmMsg = {
        sender: 'assistant',
        text: selectedLanguage === 'hi'
          ? 'Confirmation received. ₹7,499 UPI recovery execute कर दिया गया है। Status: Recovered ✓.'
          : selectedLanguage === 'mr'
          ? 'Confirmation प्राप्त झाली. ₹7,499 चा UPI recovery execute करण्यात आला आहे. Status: Recovered ✓.'
          : 'Confirmation received. ₹7,499 UPI recovery executed successfully. Transaction is now Recovered ✓.',
        lang: selectedLanguage,
      };
      setMessages((prev) => [...prev, confirmMsg]);
      voiceService.speak(confirmMsg.text);
      setPendingConfirmation(null);
    } catch (err) {
      addToast('Action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const demoPhrases = [
    { title: 'English: Revenue at risk', text: 'How much revenue is at risk today?', lang: 'en' },
    { title: 'हिंदी: कितने payment fail हुए?', text: 'आज कितने payment fail हुए?', lang: 'hi' },
    { title: 'मराठी: किती payment fail झाले?', text: 'आज किती payment fail झाले?', lang: 'mr' },
    { title: 'English: Priority attention', text: 'Which payment needs attention first?', lang: 'en' },
    { title: 'Action: Recover recommended', text: 'Recover the recommended payment.', lang: 'en' },
    { title: 'Settlement: Discrepancy inquiry', text: 'Show today\'s settlement variance.', lang: 'en' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B214A]">
            Voice Operations Console
          </h2>
          <span className="bg-pulse-lightBlue text-pulse-blue font-bold text-xs px-2.5 py-0.5 rounded-full border border-pulse-blueBorder">
            Trilingual Natural Language
          </span>
        </div>
        <p className="text-xs text-pulse-textSecondary mt-1">
          Operate the same underlying Pulse payment engine through conversational voice in English, Hindi, or Marathi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Chat & Speech Console */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-pulse-border shadow-card flex flex-col h-[650px] overflow-hidden">
          
          {/* Console Header */}
          <div className="px-5 py-3.5 bg-[#0B214A] text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#3395FF]" />
              <span className="text-xs font-bold">Live Pulse Audio Terminal</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  selectedLanguage === 'en' ? 'bg-[#3395FF] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  selectedLanguage === 'hi' ? 'bg-[#3395FF] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => handleLanguageChange('mr')}
                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  selectedLanguage === 'mr' ? 'bg-[#3395FF] text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F7F9FC]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg rounded-2xl p-4 text-xs shadow-sm space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-[#0B214A] text-white'
                      : 'bg-white text-slate-800 border border-pulse-border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-70 mb-1">
                    <span className="font-bold uppercase tracking-wider">
                      {m.sender === 'user' ? 'You' : 'Pulse Assistant'}
                    </span>
                    <span className="uppercase font-mono">{m.lang}</span>
                  </div>
                  <p className="leading-relaxed font-medium text-sm sm:text-xs">{m.text}</p>
                </div>
              </div>
            ))}

            {/* Financial Action Confirmation Card */}
            {pendingConfirmation && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-800 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Dual-Authorization Security Check
                </div>
                <p className="text-amber-900 leading-relaxed">
                  Voice operations that move or alter money require verification before execution.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    disabled={loading}
                    onClick={handleConfirmAction}
                    className="btn-primary text-xs py-2 bg-emerald-600 hover:bg-emerald-700 font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Confirm & Execute Recovery
                  </button>
                  <button
                    onClick={() => setPendingConfirmation(null)}
                    className="btn-secondary text-xs py-2"
                  >
                    Cancel Action
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-xs text-slate-400 italic">
                Pulse Intent Router processing query...
              </div>
            )}
          </div>

          {/* Input & Microphone Bar */}
          <div className="p-4 bg-white border-t border-pulse-border flex items-center gap-3">
            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white pulse-radar'
                  : 'bg-pulse-lightBlue text-pulse-blue hover:bg-[#d8ecff]'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex-1 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedLanguage === 'hi'
                    ? 'हिंदी में बोलें या टाइप करें...'
                    : selectedLanguage === 'mr'
                    ? 'मराठीमध्ये बोला किंवा टाईप करा...'
                    : 'Speak or type any payment query...'
                }
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-pulse-border rounded-xl text-xs text-pulse-textPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3395FF]"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="btn-primary text-xs py-2.5 px-4"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Reference Command Library */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-pulse-border p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-pulse-textPrimary uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-pulse-blue" />
              Example Voice Commands
            </div>
            <p className="text-xs text-pulse-textSecondary">
              Click any command to test the backend response in English, Hindi, or Marathi:
            </p>

            <div className="space-y-2">
              {demoPhrases.map((phrase, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedLanguage(phrase.lang);
                    handleSendQuery(phrase.text, phrase.lang);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 border border-pulse-border hover:border-[#3395FF] hover:bg-[#F0F7FF] transition-all text-xs group"
                >
                  <span className="font-bold text-slate-800 block group-hover:text-[#3395FF]">
                    {phrase.title}
                  </span>
                  <span className="text-[11px] text-slate-500 italic block mt-0.5">
                    "{phrase.text}"
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-pulse-border p-4 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 block text-xs">Security Protocol</span>
            <p className="text-[11px] leading-relaxed">
              Read queries respond instantly. Financial actions like "Recover payment" pause for confirmation unless Autopilot policy thresholds permit autonomous execution.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
