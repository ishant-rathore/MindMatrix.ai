
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';

export interface VoiceRecorderHandle {
  start: () => void;
  stop: () => void;
}

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onStateChange?: (isRecording: boolean) => void;
  disabled?: boolean;
}

export const VoiceRecorder = forwardRef<VoiceRecorderHandle, VoiceRecorderProps>(({ onRecordingComplete, onStateChange, disabled }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    onStateChange?.(isRecording);
  }, [isRecording, onStateChange]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  useImperativeHandle(ref, () => ({
    start: () => {
      if (!isRecording) startRecording();
    },
    stop: () => {
      if (isRecording) stopRecording();
    }
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 blob bg-teal-200 dark:bg-teal-900/50 rounded-full scale-150 opacity-50"></div>
        )}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={`relative z-10 p-6 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
        </button>
      </div>
      
      <div className="mt-4 text-slate-600 dark:text-slate-300 font-medium h-6">
        {isRecording ? (
          <span className="flex items-center gap-2 text-red-500 dark:text-red-400 animate-pulse">
            Recording... {formatTime(recordingTime)}
          </span>
        ) : (
          <span className="text-sm text-slate-400 dark:text-slate-500">Tap to speak</span>
        )}
      </div>
    </div>
  );
});

VoiceRecorder.displayName = "VoiceRecorder";
