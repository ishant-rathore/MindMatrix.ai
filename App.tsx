
import React, { useState, useEffect, useRef } from 'react';
import { AppState, AnalysisResult, Coordinates, HistoryItem, User, Language } from './types';
import { analyzeWellBeing } from './services/gemini';
import { storage } from './services/storage';
import { blobToBase64 } from './utils/audioUtils';
import { VoiceRecorder, VoiceRecorderHandle } from './components/VoiceRecorder';
import { AnalysisResults } from './components/AnalysisResults';
import { ChatInterface } from './components/ChatInterface';
import { LoginPage } from './components/LoginPage';
import { LandingPage } from './components/LandingPage';
import { CheckInAssistant } from './components/CheckInAssistant';
import { WellnessTrends } from './components/WellnessTrends';
import { 
  BrainCircuit,
  ArrowRight, 
  MessageSquareText, 
  Mic, 
  RefreshCcw,
  Sparkles,
  Bot,
  History,
  Calendar,
  Trash2,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<AppState>(AppState.LANDING); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Analyzer State
  const [textInput, setTextInput] = useState('');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [inputType, setInputType] = useState<'text' | 'voice'>('text');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const voiceRecorderRef = useRef<VoiceRecorderHandle>(null);

  // Global UI State
  const [darkMode, setDarkMode] = useState(true); 
  
  // Assistant/Chat State
  const [language, setLanguage] = useState<Language>('en');
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>(undefined);
  const [liveInitialMessage, setLiveInitialMessage] = useState<string | undefined>(undefined);
  const [autoStartLive, setAutoStartLive] = useState(false);

  // Initialize Dark Mode from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Apply Dark Mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Request location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Location access denied", error);
        }
      );
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView(AppState.IDLE);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView(AppState.LANDING); 
    handleReset();
  };

  // --- ANALYZER LOGIC ---
  const handleAnalyze = async (audioBlob?: Blob) => {
    if (view === AppState.ANALYZING) return;
    
    // Validation
    if (!audioBlob && !textInput.trim()) {
      setErrorMsg("Please enter some text or record a message.");
      return;
    }

    setErrorMsg('');
    setView(AppState.ANALYZING);

    try {
      let audioBase64: string | undefined;
      if (audioBlob) {
        audioBase64 = await blobToBase64(audioBlob);
      }

      // Pass selected language to analysis
      const result = await analyzeWellBeing(textInput, audioBase64, language);
      
      // Save to Backend (Storage)
      storage.saveAnalysis(result);

      setAnalysisResult(result);
      setView(AppState.RESULTS);
      
    } catch (error) {
      console.error(error);
      setErrorMsg("Something went wrong with the analysis. Please try again.");
      setView(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setTextInput('');
    setAnalysisResult(null);
    setChatInitialMessage(undefined);
    setLiveInitialMessage(undefined);
    setAutoStartLive(false);
    setView(AppState.IDLE);
    setErrorMsg('');
    setInputType('text'); 
  };

  const loadHistory = () => {
    const data = storage.getHistory();
    setHistoryItems(data);
    setView(AppState.HISTORY);
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this record?')) {
      const updated = storage.deleteHistoryItem(id);
      setHistoryItems(updated);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setAnalysisResult(item.result);
    setView(AppState.RESULTS);
  };
  
  // --- CHAT LOGIC ---
  const handleStartChat = (initialText?: string) => {
    if (initialText) {
      setChatInitialMessage(initialText);
    }
    setAutoStartLive(false);
    setView(AppState.CHAT);
  };

  const handleStartLive = (initialText?: string) => {
    if (initialText) {
      setLiveInitialMessage(initialText);
    }
    setAutoStartLive(true);
    setView(AppState.CHAT);
  };

  // View Routing
  if (view === AppState.LANDING) {
    return <LandingPage onStart={() => setView(AppState.LOGIN)} />;
  }

  if (view === AppState.LOGIN) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/90 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
            {/* Logo Icon */}
            <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <BrainCircuit size={22} />
            </div>
            <div className="hidden md:block">
               <h1 className="text-xl font-bold text-stone-900 dark:text-white tracking-tight leading-none font-heading group-hover:text-orange-500 transition-colors">MindMatrix.ai</h1>
               {currentUser?.role === 'admin' && (
                 <span className="text-[10px] bg-highlight-light dark:bg-amber-900/30 text-highlight-DEFAULT dark:text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-1">Admin</span>
               )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-2xl text-stone-400 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>

             <button 
              onClick={loadHistory}
              className={`p-2.5 md:px-5 md:py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                view === AppState.HISTORY 
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 shadow-sm' 
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-500'
              }`}
            >
              <History size={18} />
              <span className="hidden md:inline">History</span>
            </button>
            <button 
              onClick={() => setView(AppState.IDLE)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                view === AppState.IDLE || view === AppState.ANALYZING 
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 shadow-sm' 
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-orange-500'
              }`}
            >
              Check-in
            </button>
            <button 
              onClick={() => handleStartChat()}
              className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                view === AppState.CHAT 
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-orange-100 dark:hover:bg-stone-700'
              }`}
            >
              <Bot size={18} />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
            
            <div className="w-px h-6 bg-stone-200 dark:bg-stone-800 mx-2 hidden md:block"></div>
            
            <button
               onClick={handleLogout}
               className="p-2.5 text-stone-400 dark:text-stone-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
               title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col">
        
        {view === AppState.CHAT ? (
          <div className="flex-1 animate-fade-in">
             <ChatInterface 
                location={location} 
                user={currentUser} 
                initialMessage={chatInitialMessage}
                liveInitialMessage={liveInitialMessage}
                autoStartLive={autoStartLive}
             />
          </div>
        ) : view === AppState.HISTORY ? (
          <div className="max-w-4xl mx-auto animate-fade-in w-full">
            <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-8 flex items-center gap-3 font-heading">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                <Calendar size={28} />
              </div>
              Your Wellness Journey
            </h2>
            
            {historyItems.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-soft transition-colors duration-300">
                <div className="bg-stone-100 dark:bg-stone-800 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600 rotate-12">
                  <History size={40} />
                </div>
                <p className="text-stone-500 dark:text-stone-400 text-lg font-medium">No history yet. Start by doing a check-in!</p>
                <button 
                  onClick={() => setView(AppState.IDLE)}
                  className="mt-6 px-6 py-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                >
                  Go to Check-in
                </button>
              </div>
            ) : (
              <div>
                <WellnessTrends history={historyItems} />
                <div className="grid gap-4">
                  {historyItems.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-soft hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden hover:-translate-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm ${
                            item.result.stressLevel > 7 ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' :
                            item.result.stressLevel > 4 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {item.result.stressLevel > 7 ? '😰' : item.result.stressLevel > 4 ? '😐' : '😊'}
                          </div>
                          <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-stone-300 dark:text-stone-700">•</span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                  item.result.stressLevel > 7 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                                  item.result.stressLevel > 4 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 
                                  'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                                }`}>
                                  Stress {item.result.stressLevel}/10
                                </span>
                              </div>
                              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-1 font-heading">
                                {item.result.mood}
                              </h3>
                              <p className="text-stone-500 dark:text-stone-400 text-sm line-clamp-1 pr-8">
                                {item.result.summary}
                              </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <ChevronRight className="text-stone-300 dark:text-stone-700 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                        className="absolute top-6 right-6 p-2 text-stone-300 dark:text-stone-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Entry"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {(view === AppState.IDLE || view === AppState.ANALYZING) && (
              <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up mt-4">
                
                {/* AI Chat Gateway (Emoji) */}
                <CheckInAssistant 
                  onLanguageChange={setLanguage}
                  currentLanguage={language}
                  onStartChat={handleStartChat}
                  onStartLive={handleStartLive}
                />
                
                <div className="text-center mb-8">
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-stone-900 text-xs font-bold text-stone-500 dark:text-stone-400 shadow-sm border border-stone-200 dark:border-stone-800">
                     <ShieldCheck size={14} className="text-orange-500" />
                     <span>Logged in as {currentUser?.name}</span>
                  </div>
                </div>

                {/* Analyzer Section (Separate) */}
                <div className="flex justify-center mb-8">
                  <div className="bg-white dark:bg-stone-900 p-1.5 rounded-full shadow-soft border border-stone-200 dark:border-stone-800 inline-flex transition-colors duration-300">
                    <button
                      onClick={() => setInputType('text')}
                      className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                        inputType === 'text' 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquareText size={18} />
                        <span>Write Analyzer</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setInputType('voice')}
                      className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                        inputType === 'voice' 
                        ? 'bg-orange-500 text-white shadow-md' 
                        : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Mic size={18} />
                        <span>Speak Analyzer</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Input Area */}
                <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] shadow-soft-lg border border-stone-200 dark:border-stone-800 overflow-hidden min-h-[320px] flex flex-col relative transition-all duration-300 group hover:shadow-xl">
                  {view === AppState.ANALYZING ? (
                    // Loading State inside card
                     <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="relative w-24 h-24 mb-6">
                          <div className="absolute inset-0 border-[6px] border-stone-100 dark:border-stone-800 rounded-full"></div>
                          <div className="absolute inset-0 border-[6px] border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="text-orange-500 animate-pulse" size={32} />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2 font-heading">Analyzing...</h3>
                        <p className="text-stone-500 dark:text-stone-400 font-medium text-sm">Understanding your {inputType === 'text' ? 'words' : 'voice'}</p>
                     </div>
                  ) : (
                    inputType === 'text' ? (
                      <div className="flex-1 flex flex-col p-8 animate-fade-in">
                        <textarea
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder={language === 'hi' ? "मैं कैसा महसूस कर रहा हूँ..." : language === 'mr' ? "मला कसे वाटते..." : "I'm feeling a bit overwhelmed because..."}
                          className="w-full h-full min-h-[200px] resize-none outline-none text-xl text-stone-700 dark:text-stone-200 placeholder:text-stone-300 dark:placeholder:text-stone-600 bg-transparent transition-colors duration-300 font-medium leading-relaxed"
                          autoFocus
                        />
                        <div className="mt-4 flex justify-between items-center border-t border-stone-200 dark:border-stone-800 pt-6">
                          <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wide">
                            Clinical Analysis
                          </span>
                          <button
                              onClick={() => handleAnalyze()}
                              disabled={!textInput.trim()}
                              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-orange-500/20 dark:shadow-none"
                            >
                              Analyze Mood <ArrowRight size={20} />
                            </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-800 transition-colors duration-300 animate-fade-in">
                        <h3 className="text-xl font-bold text-stone-700 dark:text-stone-200 mb-2 font-heading">Voice Analysis</h3>
                        <p className="text-stone-400 dark:text-stone-500 text-sm mb-10 text-center max-w-xs font-medium">
                          Record for clinical tone analysis.
                        </p>
                        <VoiceRecorder 
                          ref={voiceRecorderRef}
                          onRecordingComplete={(blob) => handleAnalyze(blob)} 
                        />
                      </div>
                    )
                  )}
                </div>
                
                {errorMsg && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-center text-sm font-bold border border-red-100 dark:border-red-900/50 animate-bounce">
                    {errorMsg}
                  </div>
                )}
              </div>
            )}

            {view === AppState.RESULTS && analysisResult && (
               <div className="space-y-8 mt-8">
                   
                   {/* Risk Flag Warning */}
                   {analysisResult.riskFlag === 'high' && (
                     <div className="max-w-4xl mx-auto p-6 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-3xl flex items-start gap-4 animate-pulse">
                        <div className="p-3 bg-red-500 rounded-full text-white">
                           <AlertTriangle size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Crisis Support Available</h3>
                          <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                             We detected signs of distress. Please reach out to a trusted friend or call a local helpline immediately. You are not alone.
                          </p>
                        </div>
                     </div>
                   )}

                   <AnalysisResults result={analysisResult} location={location} />
                   
                   <div className="text-center pb-12">
                      <button 
                        onClick={handleReset}
                        className="bg-stone-800 dark:bg-white text-white dark:text-stone-900 px-8 py-3 rounded-full font-bold hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors shadow-lg"
                      >
                        Start New Check-in
                      </button>
                   </div>
               </div>
            )}
            
            {view === AppState.ERROR && (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center max-w-md mx-auto">
                <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-full text-red-500 dark:text-red-400 mb-6 shadow-sm">
                  <RefreshCcw size={48} />
                </div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3 font-heading">Oops, something went wrong.</h3>
                <p className="text-stone-600 dark:text-stone-400 mb-8 font-medium">{errorMsg}</p>
                <button 
                  onClick={handleReset}
                  className="bg-stone-800 dark:bg-white text-white dark:text-stone-900 px-8 py-3 rounded-full font-bold hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors shadow-lg"
                >
                  Try Again
                </button>
              </div>
            )}
          </>
        )}

      </main>

      <footer className="py-8 text-center text-stone-400 dark:text-stone-600 text-sm font-medium">
        <p>&copy; {new Date().getFullYear()} MindMatrix.ai. Made with 💜. Not a substitute for professional help.</p>
      </footer>
    </div>
  );
}
