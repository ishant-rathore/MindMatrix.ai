
import React, { useState, useRef, useEffect } from 'react';
import { Content } from "@google/genai";
import { 
  Send, 
  User, 
  Settings, 
  MoreHorizontal, 
  Phone, 
  Volume2, 
  VolumeX, 
  X, 
  Sliders, 
  Check, 
  Play, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Wifi, 
  WifiOff, 
  MessageSquarePlus, 
  MessageSquare, 
  Clock, 
  ArrowLeft,
  Mic,
  Loader2,
  Menu
} from 'lucide-react';
import { ChatMessage, Persona, Coordinates, User as UserType, ArchivedChat } from '../types';
import { createChatSession, detectSentimentEmoji, transcribeAudio, generateSpeech } from '../services/gemini';
import { generateOfflineResponse } from '../services/offlineAI';
import { storage } from '../services/storage';
import { LiveSession } from './LiveSession';
import { blobToBase64 } from '../utils/audioUtils';
import { base64ToUint8Array, decodeAudioData } from '../utils/pcmUtils';

// Predefined Personas with Indian Names and Real Human Photos
const PERSONAS: Persona[] = [
  // --- EMOTIONAL SUPPORT ---
  {
    id: 'ananya', 
    name: 'Ananya',
    role: 'Empathetic Friend',
    gender: 'female',
    category: 'Emotional Support',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    color: 'bg-orange-900/40 text-orange-300',
    systemInstruction: "You are Ananya, a warm, empathetic, and non-judgmental Indian friend. You listen actively, validate feelings, and offer gentle emotional support. You speak in a casual, comforting way, naturally using Hinglish (Hindi + English) idioms. Adapt your language to the user."
  },
  {
    id: 'rahul',
    name: 'Rahul',
    role: 'Best Friend',
    gender: 'male',
    category: 'Emotional Support',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    color: 'bg-emerald-900/40 text-emerald-300',
    systemInstruction: "You are Rahul, a chill and loyal best friend. You are supportive, non-judgmental, and always ready to listen or crack a joke to lighten the mood. You use casual language, bro-code slang, and references to gaming or movies to connect."
  },
  
  // --- PRODUCTIVITY & STUDY ---
  {
    id: 'aarav',
    name: 'Aarav',
    role: 'Goal Motivator',
    gender: 'male',
    category: 'Productivity',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    color: 'bg-red-900/40 text-red-300',
    systemInstruction: "You are Aarav, a high-energy motivational coach. You are focused on action, discipline, and overcoming procrastination. You speak with intensity and enthusiasm, using sports metaphors. You are tough but encouraging."
  },
  {
    id: 'riya',
    name: 'Riya',
    role: 'Study Partner',
    gender: 'female',
    category: 'Productivity',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    color: 'bg-blue-900/40 text-blue-300',
    systemInstruction: "You are Riya, a focused and organized study partner. You help break down complex topics, create study schedules, and manage academic stress. You are calm, logical, and encouraging."
  },

  // --- WISDOM & GUIDANCE ---
  {
    id: 'dadaji',
    name: 'Dadaji',
    role: 'Grandfather',
    gender: 'male',
    category: 'Family Wisdom',
    avatar: 'https://randomuser.me/api/portraits/men/90.jpg',
    color: 'bg-amber-900/40 text-amber-300',
    systemInstruction: "You are Dadaji (Grandfather). You are full of wisdom, patience, and old stories. You offer a long-term perspective on life's troubles, quoting proverbs or sharing calm, grandfatherly advice to soothe anxiety. You speak slowly and kindly."
  },
  {
    id: 'prof_rao',
    name: 'Prof. Rao',
    role: 'Academic Guide',
    gender: 'male',
    category: 'Career & Growth',
    avatar: 'https://randomuser.me/api/portraits/men/64.jpg',
    color: 'bg-indigo-900/40 text-indigo-300',
    systemInstruction: "You are Professor Rao, a wise and experienced academic mentor. You help students navigate exam pressure, career choices, and fear of failure. You are articulate, knowledgeable, and reassuring."
  },
   {
    id: 'vikrant',
    name: 'Vikrant',
    role: 'Career Mentor',
    gender: 'male',
    category: 'Career & Growth',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    color: 'bg-cyan-900/40 text-cyan-300',
    systemInstruction: "You are Vikrant, a successful tech professional and career mentor. You provide practical advice on interviews, skill building, and workplace dynamics. You are direct, professional, and practical."
  },

  // --- HEALTH ---
  {
    id: 'dr_anjali',
    name: 'Dr. Anjali',
    role: 'Health Guide',
    gender: 'female',
    category: 'Health & Wellness',
    avatar: 'https://randomuser.me/api/portraits/women/52.jpg',
    color: 'bg-teal-900/40 text-teal-300',
    systemInstruction: "You are Dr. Anjali, a compassionate wellness guide. You focus on physical health, sleep hygiene, nutrition, and mindfulness as foundations for mental well-being. You are gentle, factual, and caring."
  }
];

interface ChatInterfaceProps {
  location: Coordinates | null;
  user: UserType | null;
  initialMessage?: string;
  liveInitialMessage?: string;
  autoStartLive?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ location, user, initialMessage, liveInitialMessage, autoStartLive }) => {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]); // Default to Ananya
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [centralEmoji, setCentralEmoji] = useState('😊');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Mobile Sidebar State
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Sidebar State
  const [sidebarView, setSidebarView] = useState<'personas' | 'history'>('personas');
  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([]);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  
  // Voice Settings State
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true,
    autoSpeak: true,
  });

  // Live Session State
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);
  
  // Audio Playback Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Auto Start Live Session if requested
  useEffect(() => {
    if (autoStartLive && !isLiveSessionActive) {
      setIsLiveSessionActive(true);
    }
  }, [autoStartLive]);

  // Group personas for sidebar
  const groupedPersonas = PERSONAS.reduce((acc, persona) => {
    const category = persona.category || 'Others';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(persona);
    return acc;
  }, {} as Record<string, Persona[]>);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getWelcomeMessage = (persona: Persona, userName?: string) => {
      let welcomeText = `Namaste ${userName || ''}! I'm ${persona.name}. How are you feeling today?`;
      if (persona.category === 'Health & Wellness') welcomeText = `Hello. I am ${persona.name}, your ${persona.role}. How can I assist with your health goals today?`;
      if (persona.id === 'aarav') welcomeText = `Ready to crush some goals, ${userName || 'Champ'}? Let's do this! 💪`;
      if (persona.id === 'dadaji') welcomeText = `Greetings, beta ${userName || ''}. Come sit. What is on your mind? 🙏`;
      return welcomeText;
  };

  // Initialize Chat Session & Load History
  useEffect(() => {
    const savedMessages = storage.getChatMessages(activePersona.id);
    setMessages(savedMessages.length > 0 ? savedMessages : []);

    const geminiHistory: Content[] = savedMessages.filter(m => !m.isError).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    if (!isOfflineMode) {
      chatSessionRef.current = createChatSession(
        activePersona, 
        location || undefined,
        geminiHistory
      );
    }

    if (savedMessages.length === 0) {
      const welcomeText = getWelcomeMessage(activePersona, user?.name);
      
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'model',
        text: welcomeText,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
    
    if (sidebarView === 'history') {
      setArchivedChats(storage.getArchivedChats(activePersona.id));
    }

    return () => {
       stopSpeaking();
    };
  }, [activePersona, location, isOfflineMode, user]);
  
  // Handle Initial Message
  useEffect(() => {
    if (initialMessage && !initialSentRef.current) {
        // Send message immediately
        handleSend(initialMessage);
        initialSentRef.current = true;
    }
  }, [initialMessage]); 

  useEffect(() => {
    if (sidebarView === 'history') {
      setArchivedChats(storage.getArchivedChats(activePersona.id));
    }
  }, [sidebarView, activePersona.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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
  };

  const speakResponse = async (text: string) => {
    stopSpeaking(); 

    // Clean text for TTS (remove emojis/formatting)
    const cleanText = text.replace(/\{\{.*?\}\}/g, '').replace(/[\*\#]/g, '').trim();
    if (!cleanText) return;

    setIsSpeaking(true);

    // Use Gemini TTS - Select voice based on persona gender
    const voiceName = activePersona.gender === 'male' ? 'Fenrir' : 'Kore';
    
    try {
        const base64Audio = await generateSpeech(cleanText, voiceName);

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
             
             source.onended = () => setIsSpeaking(false);
             source.start();
             audioSourceRef.current = source;
        } else {
             setIsSpeaking(false);
        }
    } catch (e) {
        console.error("Audio playback error", e);
        setIsSpeaking(false);
    }
  };

  const handleMicToggle = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        setIsTyping(true);
        try {
          const base64 = await blobToBase64(blob);
          const transcription = await transcribeAudio(base64);
          if (transcription) {
             setInput((prev) => prev ? `${prev} ${transcription}` : transcription);
          }
        } catch (error) {
          console.error("Transcription error", error);
        } finally {
          setIsTyping(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied", error);
      alert("Please allow microphone access to use this feature.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isTyping) return;

    // Stop speaking if user interrupts
    stopSpeaking();

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    storage.saveChatMessage(activePersona.id, userMsg);

    try {
      let responseText = "";
      
      if (isOfflineMode) {
        responseText = await generateOfflineResponse(activePersona.id, userMsg.text, user?.name);
      } else {
        if (!chatSessionRef.current) {
            const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
            chatSessionRef.current = createChatSession(activePersona, location || undefined, history);
        }
        const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
        responseText = result.text;
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, modelMsg]);
      storage.saveChatMessage(activePersona.id, modelMsg);
      
      const emojiMatch = responseText.match(/\{\{(.*?)\}\}/);
      if (emojiMatch && emojiMatch[1]) {
        setCentralEmoji(emojiMatch[1]);
      }

      if (voiceSettings.enabled && voiceSettings.autoSpeak) {
        speakResponse(responseText);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please check your internet connection.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    stopSpeaking();
    if (messages.length > 0) {
        storage.archiveChat(activePersona.id);
        setArchivedChats(storage.getArchivedChats(activePersona.id));
    }
    setMessages([]);
    chatSessionRef.current = createChatSession(activePersona, location || undefined);
    
    const welcomeText = getWelcomeMessage(activePersona, user?.name);
    const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'model',
        text: welcomeText,
        timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in relative">
        {isLiveSessionActive && (
            <LiveSession 
               persona={activePersona} 
               onClose={() => setIsLiveSessionActive(false)} 
               initialMessage={liveInitialMessage}
            />
        )}

        {/* Mobile Sidebar Backdrop */}
        {showMobileMenu && (
            <div 
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-fade-in"
                onClick={() => setShowMobileMenu(false)}
            />
        )}

        {/* Sidebar - Responsive (Drawer on Mobile, Static on Desktop) */}
        <div className={`
             flex flex-col bg-stone-900 border-stone-800 overflow-hidden
             fixed inset-y-0 left-0 z-50 w-80 h-full shadow-2xl transition-transform duration-300 ease-in-out border-r
             md:relative md:w-80 md:h-auto md:rounded-[2rem] md:shadow-soft md:border md:translate-x-0 md:z-0 md:inset-auto
             ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
        `}>
             {/* Mobile Header (Close Button) */}
             <div className="flex md:hidden justify-between items-center p-4 border-b border-stone-800">
                 <span className="font-bold text-stone-100 font-heading">Menu</span>
                 <button onClick={() => setShowMobileMenu(false)} className="text-stone-400 hover:text-white">
                     <X size={24} />
                 </button>
             </div>

             {/* Sidebar Tabs */}
             <div className="flex border-b border-stone-800 p-2 shrink-0">
                 <button 
                   onClick={() => setSidebarView('personas')}
                   className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${sidebarView === 'personas' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:bg-stone-800/50'}`}
                 >
                    Personas
                 </button>
                 <button 
                   onClick={() => setSidebarView('history')}
                   className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${sidebarView === 'history' ? 'bg-stone-800 text-stone-100' : 'text-stone-400 hover:bg-stone-800/50'}`}
                 >
                    History
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {sidebarView === 'personas' ? (
                   <div className="space-y-6">
                      {Object.entries(groupedPersonas).map(([category, personas]) => (
                          <div key={category}>
                             <button 
                               onClick={() => toggleCategory(category)}
                               className="flex items-center justify-between w-full text-xs font-bold text-stone-500 uppercase tracking-wider mb-3 hover:text-orange-400 transition-colors"
                             >
                                <span>{category}</span>
                                <ChevronDown size={14} className={`transition-transform ${collapsedCategories[category] ? '-rotate-90' : ''}`} />
                             </button>
                             {!collapsedCategories[category] && (
                                 <div className="space-y-2">
                                     {personas.map(p => (
                                         <div 
                                           key={p.id}
                                           onClick={() => { setActivePersona(p); setShowMobileMenu(false); }}
                                           className={`p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all ${activePersona.id === p.id ? 'bg-stone-700 text-white shadow-md' : 'hover:bg-stone-800/50 text-stone-400'}`}
                                         >
                                             <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full border border-white/10" />
                                             <div className="flex-1 min-w-0">
                                                 <div className="font-bold text-sm truncate">{p.name}</div>
                                                 <div className={`text-[10px] truncate opacity-70`}>{p.role}</div>
                                             </div>
                                             {activePersona.id === p.id && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                                         </div>
                                     ))}
                                 </div>
                             )}
                          </div>
                      ))}
                   </div>
                ) : (
                   <div className="space-y-2">
                       <button onClick={() => { handleNewChat(); setShowMobileMenu(false); }} className="w-full py-3 mb-4 rounded-xl bg-orange-900/30 text-orange-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-colors">
                           <MessageSquarePlus size={16} /> New Chat
                       </button>
                       {archivedChats.length === 0 ? (
                           <div className="text-center text-stone-400 text-xs mt-10">No archived chats yet.</div>
                       ) : (
                           archivedChats.map(chat => (
                               <div key={chat.id} className="p-4 rounded-2xl bg-stone-800 border border-stone-700 hover:border-orange-500 transition-all cursor-pointer group">
                                   <div className="flex justify-between items-center mb-1">
                                       <span className="text-xs font-bold text-stone-400">{new Date(chat.timestamp).toLocaleDateString()}</span>
                                       <ArrowLeft size={14} className="opacity-0 group-hover:opacity-100 text-orange-400" />
                                   </div>
                                   <div className="text-sm font-bold text-stone-300 truncate">
                                       {chat.messages.length} messages
                                   </div>
                               </div>
                           ))
                       )}
                   </div>
                )}
             </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-stone-900 rounded-[2rem] shadow-soft border border-stone-800 flex flex-col relative overflow-hidden">
            
            <div className="p-4 md:p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/90 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    {/* Mobile Menu Toggle */}
                    <button 
                       onClick={() => setShowMobileMenu(true)} 
                       className="md:hidden text-stone-400 hover:text-white transition-colors p-1"
                     >
                        <Menu size={24} />
                     </button>

                    <div className="relative">
                        <img src={activePersona.avatar} alt={activePersona.name} className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-stone-700 shadow-md object-cover" />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-stone-800 rounded-full ${isOfflineMode ? 'bg-stone-400' : 'bg-green-500'}`}></span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-stone-100 font-heading flex items-center gap-2">
                           {activePersona.name}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
                           <span className={`px-2 py-0.5 rounded-md ${activePersona.color}`}>{activePersona.role}</span>
                           {isOfflineMode && <span className="flex items-center gap-1 text-stone-500"><WifiOff size={10} /> Offline Mode</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsOfflineMode(!isOfflineMode)}
                      className={`p-2.5 rounded-full transition-all ${isOfflineMode ? 'bg-stone-800 text-stone-400' : 'text-orange-400 bg-orange-900/30 hover:bg-orange-900/50'}`}
                      title={isOfflineMode ? "Go Online" : "Go Offline"}
                    >
                        {isOfflineMode ? <WifiOff size={20} /> : <Wifi size={20} />}
                    </button>
                    <button 
                      onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                      className={`p-2.5 rounded-full transition-all ${showVoiceSettings ? 'bg-stone-800 text-stone-400' : 'text-stone-400 hover:bg-stone-800'}`}
                    >
                        {isSpeaking ? <Volume2 size={20} className="text-orange-400 animate-pulse" /> : <Settings size={20} />}
                    </button>
                    {!isOfflineMode && (
                        <button 
                        onClick={() => setIsLiveSessionActive(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
                        >
                            <Phone size={18} fill="currentColor" />
                            <span>Live Call</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Voice Settings Panel */}
            {showVoiceSettings && (
                <div className="absolute top-24 right-6 w-72 bg-stone-800 rounded-2xl shadow-xl border border-stone-700 p-4 z-20 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-stone-200">Voice Settings</h4>
                        <button onClick={() => setShowVoiceSettings(false)}><X size={16} className="text-stone-400" /></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-400">Enable Voice</span>
                            <button 
                              onClick={() => setVoiceSettings(p => ({...p, enabled: !p.enabled}))}
                              className={`w-10 h-6 rounded-full transition-colors relative ${voiceSettings.enabled ? 'bg-orange-500' : 'bg-stone-600'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${voiceSettings.enabled ? 'left-5' : 'left-1'}`}></div>
                            </button>
                        </div>
                        
                        {voiceSettings.enabled && (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-stone-400">Auto-speak</span>
                                    <button 
                                    onClick={() => setVoiceSettings(p => ({...p, autoSpeak: !p.autoSpeak}))}
                                    className={`w-10 h-6 rounded-full transition-colors relative ${voiceSettings.autoSpeak ? 'bg-orange-500' : 'bg-stone-600'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${voiceSettings.autoSpeak ? 'left-5' : 'left-1'}`}></div>
                                    </button>
                                </div>
                                <div className="text-xs text-stone-500 mt-2 p-2 bg-stone-700/50 rounded-lg">
                                    Using high-quality Gemini TTS voices. Voice selection is automatic based on persona gender.
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-stone-900 relative">
                
                {/* Central Large Emoji - Sticky Upper Center */}
                <div className="sticky top-6 z-0 flex justify-center w-full pointer-events-none mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-accent-DEFAULT/20 blur-3xl rounded-full"></div>
                        <div className="text-8xl md:text-9xl drop-shadow-2xl animate-bounce-slow transition-all duration-700 transform hover:scale-110 filter brightness-110 relative z-10">
                            {centralEmoji}
                        </div>
                    </div>
                </div>

                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    const showAvatar = !isUser && (idx === 0 || messages[idx - 1].role === 'user');
                    
                    const displayText = msg.text.replace(/\{\{(.*?)\}\}/g, '');
                    const sentimentEmoji = msg.text.match(/\{\{(.*?)\}\}/)?.[1];

                    return (
                        <div key={msg.id} className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up relative z-10`}>
                            {!isUser && (
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                    <img src={activePersona.avatar} className="w-10 h-10 rounded-full border border-stone-700 shadow-sm" alt="AI" />
                                </div>
                            )}
                            
                            <div className={`max-w-[80%] md:max-w-[70%] space-y-1`}>
                                <div className={`p-4 rounded-2xl shadow-sm text-base leading-relaxed ${
                                    isUser 
                                    ? 'bg-orange-600 text-white rounded-tr-sm' 
                                    : 'bg-stone-800 text-stone-200 rounded-tl-sm border border-stone-700'
                                }`}>
                                    {sentimentEmoji && !isUser && <span className="text-xl mr-2">{sentimentEmoji}</span>}
                                    {displayText}
                                </div>
                                <div className={`text-[10px] text-stone-400 font-bold ${isUser ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>

                            {isUser && (
                                <div className="flex-shrink-0 w-10 h-10 bg-stone-700 rounded-full flex items-center justify-center">
                                    <User size={20} className="text-stone-400" />
                                </div>
                            )}
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex gap-4 justify-start animate-fade-in-up relative z-10">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center">
                            <img src={activePersona.avatar} className="w-10 h-10 rounded-full border border-stone-700 shadow-sm opacity-80" alt="AI Typing" />
                        </div>
                        <div className="bg-stone-800 px-5 py-4 rounded-[2rem] rounded-tl-sm border border-stone-700 shadow-sm flex items-center gap-1.5 h-14">
                            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce"></span>
                            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></span>
                            <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-stone-900 border-t border-stone-800 relative z-20">
                <div className="relative flex items-center gap-3">
                    <button 
                      onClick={handleNewChat}
                      className="p-3 rounded-full text-stone-400 hover:bg-stone-800 transition-colors md:hidden"
                    >
                        <MessageSquarePlus size={24} />
                    </button>
                    
                    <div className="flex-1 relative bg-stone-800 rounded-3xl transition-all focus-within:ring-2 focus-within:ring-orange-500/50">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={isOfflineMode ? "Type a message (Offline)..." : isRecording ? "Listening..." : `Message ${activePersona.name}...`}
                            className="w-full bg-transparent border-none outline-none py-4 pl-6 pr-12 text-stone-200 placeholder:text-stone-400 font-medium"
                            disabled={isTyping}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                           <button 
                             onClick={handleMicToggle}
                             className={`p-2 rounded-full transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'}`}
                             title={isRecording ? "Stop Recording" : "Start Recording"}
                           >
                              <Mic size={20} />
                           </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="p-4 bg-white text-stone-900 rounded-full hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg"
                    >
                        <Send size={20} fill="currentColor" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                        {isOfflineMode ? "Offline AI Active" : "Gemini 2.5 Flash Lite Connected"}
                    </span>
                </div>
            </div>
        </div>
    </div>
  );
};
