
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Phone, Volume2, Loader2, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { generateSpeech } from '../services/gemini';
import { base64ToUint8Array, decodeAudioData } from '../utils/pcmUtils';

interface CheckInAssistantProps {
  onLanguageChange: (lang: Language) => void;
  currentLanguage: Language;
  onStartChat: (text?: string) => void; 
  onStartLive: (text?: string) => void;
}

const GREETINGS = {
  en: ["Hi friend! I'm here to chat.", "Namaste! How are you?", "Hello! You can talk to me."],
  hi: ["नमस्ते दोस्त! मैं यहाँ हूँ।", "कहो, कैसे हो?", "नमस्ते! आप मुझसे बात कर सकते हैं।"],
  mr: ["नमस्कार मित्र! मी इथे आहे.", "बोला, कसे आहात?", "नमस्कार! तुम्ही माझ्याशी बोलू शकता."]
};

export const CheckInAssistant: React.FC<CheckInAssistantProps> = ({ 
  onLanguageChange, 
  currentLanguage,
  onStartChat,
  onStartLive
}) => {
  const [speechBubbleText, setSpeechBubbleText] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initial greeting visual only
    const options = GREETINGS[currentLanguage];
    const greeting = options[Math.floor(Math.random() * options.length)];
    setSpeechBubbleText(greeting);
    setShowBubble(true);
    // Stop speaking if language changes
    stopSpeaking();
  }, [currentLanguage]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const stopSpeaking = () => {
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) {}
        audioSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  };

  const handleEmojiClick = async () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!speechBubbleText || isLoadingAudio) return;

    setIsLoadingAudio(true);
    try {
      const base64Audio = await generateSpeech(speechBubbleText, 'Kore');

      if (base64Audio) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        
        const audioBuffer = await decodeAudioData(
            base64ToUint8Array(base64Audio),
            audioContextRef.current,
            24000,
            1
        );
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setIsSpeaking(false);
        };
        
        source.start();
        audioSourceRef.current = source;
        setIsSpeaking(true);
      }
    } catch (e) {
      console.error("Speech generation failed", e);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim()) {
      stopSpeaking();
      // CHANGED: Now defaults to Live Session (Emoji) instead of Chat Interface
      onStartLive(inputText);
      setInputText("");
    }
  };

  const handleStartChat = () => {
    stopSpeaking();
    onStartChat();
  };
  
  const handleStartLive = () => {
    stopSpeaking();
    onStartLive();
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 relative z-20">
      
      {/* Speech Bubble */}
      <div className={`mb-6 transition-all duration-500 transform ${showBubble ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl rounded-bl-sm p-4 shadow-soft-lg max-w-xs mx-auto text-center relative">
          <p className="text-stone-700 dark:text-stone-200 font-medium text-lg leading-relaxed">
            {speechBubbleText}
          </p>
          {/* Arrow */}
          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white dark:bg-stone-800 border-b border-l border-stone-200 dark:border-stone-700 transform -rotate-45"></div>
        </div>
      </div>

      {/* Interactive Emoji Avatar */}
      <button 
        onClick={handleEmojiClick}
        disabled={isLoadingAudio}
        className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-orange-100 to-white dark:from-stone-800 dark:to-stone-900 shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)] border-4 border-white dark:border-stone-700 flex items-center justify-center text-7xl md:text-8xl transition-all duration-300 ease-out relative overflow-hidden group ${isLoadingAudio ? 'scale-95 opacity-80 cursor-wait' : 'hover:scale-105 cursor-pointer'}`}
        aria-label={isSpeaking ? "Stop speaking" : "Speak greeting"}
      >
        {isSpeaking && (
           <div className="absolute inset-0 bg-orange-500/10 rounded-full animate-pulse"></div>
        )}
        
        <span className={`filter drop-shadow-md select-none transition-transform duration-300 ${isSpeaking ? 'animate-bounce' : 'animate-bounce-slow'}`}>
            😊
        </span>
        
        {/* Speak Icon overlay on hover or loading */}
        <div className={`absolute bottom-4 right-8 transform translate-x-1/2 translate-y-1/2 p-2 bg-white dark:bg-stone-800 rounded-full shadow-md border border-stone-100 dark:border-stone-600 transition-opacity duration-300 ${isSpeaking || isLoadingAudio ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {isLoadingAudio ? <Loader2 size={16} className="animate-spin text-orange-500" /> : <Volume2 size={16} className={isSpeaking ? "text-orange-500 animate-pulse" : "text-stone-400"} />}
        </div>
      </button>
      
      <div className="mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest opacity-0 hover:opacity-100 transition-opacity">
        Tap to {isSpeaking ? "Stop" : "Listen"}
      </div>

      {/* Controls: Language & Input */}
      <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-sm px-4">
        
        <div className="bg-white dark:bg-stone-900 p-1 rounded-full border border-stone-200 dark:border-stone-800 shadow-sm flex items-center">
           {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
             <button
               key={lang}
               onClick={() => onLanguageChange(lang)}
               className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${currentLanguage === lang ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 shadow-md' : 'text-stone-400 hover:text-orange-500'}`}
             >
               {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
             </button>
           ))}
        </div>

        {/* Quick Text Input for Live Chat */}
        <form onSubmit={handleSubmit} className="w-full relative mt-2 animate-fade-in-up group">
             <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={currentLanguage === 'hi' ? "इमोजी से बात करें..." : currentLanguage === 'mr' ? "इमोजीशी बोला..." : "Talk to Emoji..."}
                className="w-full py-3 px-5 pr-12 rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-700 dark:text-stone-200 placeholder:text-stone-400"
             />
             <button 
                type="submit"
                disabled={!inputText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:bg-stone-400 transition-colors shadow-md"
             >
                <Sparkles size={16} />
             </button>
        </form>

        <div className="flex gap-4 items-center mt-2 w-full justify-center">
          <button 
            onClick={handleStartLive}
            className="text-sm font-bold text-white flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 px-6 py-3 rounded-full shadow-md shadow-orange-500/20 transition-all active:scale-95 animate-pulse-slow w-full justify-center"
          >
            <Phone size={18} fill="currentColor" />
            <span>Talk to Emoji</span>
          </button>
        </div>
        
        <button 
            onClick={handleStartChat}
            className="text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors mt-2"
        >
            Switch to Text Chat History
        </button>
      </div>

    </div>
  );
};
