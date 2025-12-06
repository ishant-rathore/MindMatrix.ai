
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Persona } from '../types';
import { createPcmBlob, decodeAudioData, base64ToUint8Array } from '../utils/pcmUtils';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, ScanFace, Activity, Captions, Zap, AlertCircle, Volume2, Play, Send } from 'lucide-react';

interface LiveSessionProps {
  persona: Persona;
  onClose: () => void;
  initialMessage?: string;
}

export const LiveSession: React.FC<LiveSessionProps> = ({ persona, onClose, initialMessage }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isTalking, setIsTalking] = useState(false); // Visual indicator for user speech
  const [textInput, setTextInput] = useState(""); // Text input state

  // Transcriptions & Emoji
  const [userTranscript, setUserTranscript] = useState(initialMessage || "");
  const [aiTranscript, setAiTranscript] = useState("");
  const [currentEmoji, setCurrentEmoji] = useState("😊");

  // Refs for tracking state inside callbacks (Fixes stale closures)
  const isMicOnRef = useRef(true);
  const isVideoOnRef = useRef(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputNodeRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Audio Visualization Refs
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Logic Refs
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const initialMessageSentRef = useRef(false);

  // Sync refs with state
  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    isVideoOnRef.current = isVideoOn;
  }, [isVideoOn]);

  useEffect(() => {
    startSession();

    // Check for suspended audio context every second
    const interval = setInterval(() => {
      if (outputAudioContextRef.current?.state === 'running') {
        setIsAudioActive(true);
      } else {
        setIsAudioActive(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      stopSession();
    };
  }, []);

  const activateAudio = async () => {
    try {
      if (inputAudioContextRef.current && inputAudioContextRef.current.state === 'suspended') {
        await inputAudioContextRef.current.resume();
        console.log("Input Audio Context Resumed");
      }
      if (outputAudioContextRef.current && outputAudioContextRef.current.state === 'suspended') {
        await outputAudioContextRef.current.resume();
        console.log("Output Audio Context Resumed");
      }
      setIsAudioActive(true);
    } catch (e) {
      console.error("Audio activation failed", e);
    }
  };

  const handleSendText = async () => {
    if (!textInput.trim()) return;
    
    const text = textInput;
    setTextInput("");
    
    // Show user text immediately
    setUserTranscript(prev => (prev ? prev + " " + text : text)); 

    try {
        if (sessionPromiseRef.current) {
            const session = await sessionPromiseRef.current;
            session.send({
                clientContent: {
                    turns: [{
                        role: 'user',
                        parts: [{ text: text }]
                    }],
                    turnComplete: true
                }
            });
        }
    } catch (e) {
        console.error("Error sending text", e);
    }
  };

  const downsampleBuffer = (buffer: Float32Array, inputRate: number, outputRate: number) => {
    if (outputRate === inputRate) return buffer;
    
    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    
    let offsetResult = 0;
    let offsetBuffer = 0;
    
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    
    return result;
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContextClass(); 
      outputAudioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      
      // Attempt auto-resume
      if (outputAudioContextRef.current.state === 'running') setIsAudioActive(true);

      // Setup Visualizer Analyser
      const analyser = outputAudioContextRef.current.createAnalyser();
      analyser.fftSize = 64; 
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      outputNodeRef.current = outputAudioContextRef.current.createGain();
      outputNodeRef.current.connect(analyser);
      analyser.connect(outputAudioContextRef.current.destination);

      visualizeAudio();

      // 2. Get Media Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;

      // 3. Setup Video Preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // 4. Connect to Gemini Live
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are a friendly live emoji assistant named ${persona.name}.
          
          YOUR GOAL: Listen to the user. Respond concisely (1 sentence).
          
          CRITICAL: 
          1. START EVERY RESPONSE with a sentiment emoji in double curly braces, e.g., {{😊}}, {{😮}}.
          2. Speak in the language the user speaks.
          3. Keep responses short and warm.
          `,
        },
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            console.log("Live Session Connected");
            setIsConnected(true);
            
            // Send Initial Message if present
            if (initialMessage && !initialMessageSentRef.current) {
                initialMessageSentRef.current = true;
                // Wait slightly for session to be fully ready or just send
                setTimeout(() => {
                    sessionPromise.then(session => {
                        session.send({
                            clientContent: {
                                turns: [{
                                    role: 'user',
                                    parts: [{ text: initialMessage }]
                                }],
                                turnComplete: true
                            }
                        });
                    });
                }, 500);
            }
            
            if (!inputAudioContextRef.current || !stream) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = processor;
            
            const muteNode = inputAudioContextRef.current.createGain();
            muteNode.gain.value = 0;

            source.connect(processor);
            processor.connect(muteNode);
            muteNode.connect(inputAudioContextRef.current.destination);

            processor.onaudioprocess = (e) => {
              if (!isMicOnRef.current) return; 

              const inputData = e.inputBuffer.getChannelData(0);

              // Calculate Volume for UI and Noise Gate
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setMicVolume(Math.min(1, rms * 5));

              // NOISE GATE: Only send if volume is above threshold
              // This prevents sending silence which makes the model wait endlessly
              if (rms < 0.02) {
                setIsTalking(false);
                return;
              }
              
              setIsTalking(true);

              // Downsample to 16000Hz
              const currentRate = inputAudioContextRef.current?.sampleRate || 48000;
              const downsampledData = downsampleBuffer(inputData, currentRate, 16000);
              
              const pcmBlob = createPcmBlob(downsampledData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            startVideoStreaming(sessionPromise);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current && outputNodeRef.current) {
              const ctx = outputAudioContextRef.current;
              
              if (ctx.state === 'suspended') {
                 try {
                   await ctx.resume();
                   setIsAudioActive(true);
                 } catch(e) { console.warn("Auto-resume failed"); }
              }

              // AUDIO SYNC FIX: Ensure we don't schedule in the past
              const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
              nextStartTimeRef.current = startTime;
              
              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNodeRef.current);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(startTime);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const outputTx = msg.serverContent?.outputTranscription?.text;
            const inputTx = msg.serverContent?.inputTranscription?.text;

            if (outputTx) {
               const emojiMatch = outputTx.match(/\{\{(.*?)\}\}/);
               if (emojiMatch && emojiMatch[1]) {
                 setCurrentEmoji(emojiMatch[1]);
               }
               const cleanTx = outputTx.replace(/\{\{.*?\}\}/g, '');
               setAiTranscript(prev => prev + cleanTx);
            }
            if (inputTx) {
               setUserTranscript(prev => prev + inputTx);
            }

            if (msg.serverContent?.turnComplete) {
               setTimeout(() => { setUserTranscript(""); }, 3000);
               setTimeout(() => { setAiTranscript(""); }, 5000);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setAiTranscript(""); 
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setIsConnected(false);
          },
          onerror: (err) => {
            console.error("Live Session Error:", err);
            setError("Connection failed. Please try again.");
          }
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to start session:", err);
      setError("Could not access camera/microphone or connect to AI.");
    }
  };

  const startVideoStreaming = (sessionPromise: Promise<any>) => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);

    videoIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current || !isVideoOnRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const scale = 0.5; 
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Data = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        
        sessionPromise.then(session => {
          session.sendRealtimeInput({
            media: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          });
        });
      }
    }, 500); 
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const indices = [1, 3, 5, 7, 10]; 
    indices.forEach((dataIndex, i) => {
      const bar = barRefs.current[i];
      if (bar) {
        const value = dataArray[dataIndex] || 5; 
        const heightPercent = Math.max(10, (value / 255) * 100);
        bar.style.height = `${heightPercent}%`;
      }
    });

    animationFrameRef.current = requestAnimationFrame(visualizeAudio);
  };

  const stopSession = () => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
    }
    
    if (videoIntervalRef.current) window.clearInterval(videoIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close();
    }

    onClose();
  };

  const toggleMic = () => {
    setIsMicOn(prev => !prev);
  };

  const toggleVideo = () => {
    const newState = !isVideoOn;
    setIsVideoOn(newState);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = newState);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
      <div className="relative w-full max-w-4xl h-full max-h-[800px] bg-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-700">
        
        {/* INTERACTION OVERLAY: Forces user to click if audio is suspended */}
        {!isAudioActive && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={activateAudio}>
             <button 
               className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl animate-bounce flex items-center gap-3"
             >
               <Play size={24} fill="currentColor" />
               Tap to Start Audio
             </button>
          </div>
        )}

        {/* RIGHT SIDE BUTTONS (Activate Voice) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-30">
          <button 
            onClick={activateAudio}
            className={`p-4 rounded-full backdrop-blur-md border transition-all shadow-lg active:scale-95 group relative ${
              isAudioActive 
                ? 'bg-green-500/20 border-green-500 text-green-400' 
                : 'bg-white/10 border-white/20 text-white hover:bg-orange-500 hover:border-orange-500 animate-pulse'
            }`}
          >
             {isAudioActive ? <Zap size={24} fill="currentColor" /> : <Zap size={24} />}
             <span className="absolute right-full mr-4 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
               {isAudioActive ? "Voice Active" : "Click to Activate Voice"}
             </span>
             {!isAudioActive && (
               <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black"></span>
             )}
          </button>
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
             <div className="relative">
               <img src={persona.avatar} alt={persona.name} className="w-12 h-12 rounded-full border-2 border-white/20" />
               <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
             </div>
             <div>
               <h3 className="text-white font-bold text-lg drop-shadow-md">{persona.name}</h3>
               <div className="flex items-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                 <p className="text-white/80 text-sm drop-shadow-md font-medium">
                    {isConnected ? 'LIVE • Detecting Emotions' : 'Connecting...'}
                 </p>
               </div>
             </div>
          </div>
          <button onClick={stopSession} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors text-white pointer-events-auto backdrop-blur-md">
            <X size={24} />
          </button>
        </div>

        {/* Main Video Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          
          {/* User Video (Self) */}
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isVideoOn ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* Video Off State */}
          {!isVideoOn && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-stone-800 flex items-center justify-center">
                <VideoOff size={48} className="text-stone-500" />
              </div>
            </div>
          )}

          {/* DYNAMIC EMOJI AVATAR OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
             <div className="relative animate-bounce-slow">
               <div className="absolute inset-0 bg-white/20 rounded-full blur-[60px]"></div>
               <div className="text-[12rem] md:text-[15rem] filter drop-shadow-[0_0_30px_rgba(249,115,22,0.5)] transform scale-x-[-1] transition-all duration-300 ease-out">
                 {currentEmoji}
               </div>
             </div>
          </div>

          {/* Subtitles Overlay */}
          {(userTranscript || aiTranscript) && (
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-none px-6 z-20 pt-60">
               {userTranscript && (
                 <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl text-white/90 text-lg font-medium text-center max-w-2xl animate-fade-in-up border border-white/10">
                   <span className="text-stone-400 text-xs uppercase tracking-wide block mb-1">You</span>
                   {userTranscript}
                 </div>
               )}
               {aiTranscript && (
                 <div className="bg-orange-600/80 backdrop-blur-md px-6 py-3 rounded-2xl text-white text-lg font-medium text-center max-w-2xl animate-fade-in-up border border-orange-500/30">
                   <span className="text-orange-200 text-xs uppercase tracking-wide block mb-1">{persona.name}</span>
                   {aiTranscript}
                 </div>
               )}
            </div>
          )}

          {/* AI Live Audio Visualizer */}
          <div className="absolute bottom-28 sm:bottom-28 left-0 right-0 flex flex-col items-center justify-center pointer-events-none gap-4 z-20">
            {isConnected ? (
              <>
                <div className="flex items-center gap-1.5 h-16">
                   {[0, 1, 2, 3, 4].map((i) => (
                     <div 
                       key={i}
                       ref={(el) => { barRefs.current[i] = el; }}
                       className="w-2 bg-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] transition-[height] duration-75 ease-linear"
                       style={{ height: '10%' }}
                     ></div>
                   ))}
                </div>
                <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-white/90 text-sm font-medium flex items-center gap-2">
                  <Captions size={14} className="text-orange-400" />
                  {persona.name} is listening...
                </div>
              </>
            ) : (
              <div className="bg-black/50 px-6 py-2 rounded-full text-white/80 animate-pulse font-mono text-sm border border-white/10">
                ESTABLISHING SECURE CONNECTION...
              </div>
            )}
          </div>
          
          {/* Text Input Overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 px-4">
              <div className="flex items-center gap-2 w-full max-w-md bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 focus-within:border-orange-500/50 transition-colors shadow-lg">
                  <input 
                      type="text" 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                      placeholder={`Type to ${persona.name}...`}
                      className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 text-sm placeholder:text-stone-400 font-medium"
                  />
                  <button 
                      onClick={handleSendText}
                      disabled={!textInput.trim()}
                      className="p-2.5 bg-orange-500 hover:bg-orange-600 rounded-full text-white disabled:opacity-50 disabled:bg-stone-700 transition-all"
                  >
                      <Send size={16} fill="currentColor" />
                  </button>
              </div>
          </div>
          
          {error && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
              <div className="bg-red-500/20 text-red-200 p-6 rounded-2xl max-w-md text-center border border-red-500/50 backdrop-blur-md">
                <p className="font-bold mb-2">Connection Error</p>
                <p>{error}</p>
                <button onClick={onClose} className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors">Close</button>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-stone-900 p-6 flex justify-center gap-8 items-center border-t border-stone-800 z-20">
           <button 
             onClick={toggleMic}
             className={`p-4 rounded-full transition-all duration-200 relative ${isMicOn ? 'bg-stone-700 text-white hover:bg-stone-600' : 'bg-red-500/20 text-red-500 ring-2 ring-red-500/30'}`}
             title={isMicOn ? "Mute Mic" : "Unmute Mic"}
           >
             {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
             {/* Mic Volume Indicator Ring */}
             {isMicOn && (
               <div 
                 className={`absolute inset-0 rounded-full border-4 border-green-500 transition-all duration-75 opacity-50 ${isTalking ? 'scale-110 opacity-100 border-green-400' : 'scale-100'}`}
                 style={{ transform: `scale(${1 + micVolume * 0.5})` }}
               ></div>
             )}
           </button>
           
           <button 
             onClick={stopSession}
             className="p-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-transform hover:scale-110 shadow-lg shadow-red-600/30 active:scale-95"
             title="End Call"
           >
             <PhoneOff size={32} fill="currentColor" />
           </button>
           
           <button 
             onClick={toggleVideo}
             className={`p-4 rounded-full transition-all duration-200 ${isVideoOn ? 'bg-stone-700 text-white hover:bg-stone-600' : 'bg-red-500/20 text-red-500 ring-2 ring-red-500/30'}`}
             title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
           >
             {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
           </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <style>{`
        @keyframes scan { 0% { top: 0; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};
