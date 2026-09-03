// Browser Web Speech API service with English, Hindi, Marathi support and fallback

class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening = false;
    this.language = 'en'; // 'en', 'hi', 'mr'

    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.updateLanguageLocale();
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  setLanguage(lang) {
    this.language = lang;
    this.updateLanguageLocale();
  }

  updateLanguageLocale() {
    if (!this.recognition) return;
    const locales = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN',
    };
    this.recognition.lang = locales[this.language] || 'en-IN';
  }

  startListening({ onStart, onResult, onError, onEnd }) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser. Please use text input or Chrome.');
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      if (onStart) onStart();
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      if (onError) onError(e.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text) {
    if (!this.synthesis) return;
    try {
      this.synthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      const locales = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
      };
      utterance.lang = locales[this.language] || 'en-IN';
      utterance.rate = 0.95;
      this.synthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }
}

export const voiceService = new VoiceService();
export default voiceService;
