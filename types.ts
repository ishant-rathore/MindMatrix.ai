
export interface AnalysisResult {
  mood: string;
  stressLevel: number; // 1-10
  summary: string;
  copingStrategies: string[];
  assistantReply?: string; // Conversational reply in selected language
  riskFlag?: 'low' | 'medium' | 'high'; // Crisis detection
}

export type Language = 'en' | 'hi' | 'mr';

export interface ResourceItem {
  title: string;
  uri: string;
  source: string;
}

export enum AppState {
  LANDING = 'LANDING', // Added LANDING state
  LOGIN = 'LOGIN', 
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR',
  CHAT = 'CHAT',
  HISTORY = 'HISTORY',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date | string; // Allow string for serialization
  isError?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string; // URL or emoji
  color: string;
  systemInstruction: string;
  category?: string;
  gender?: 'male' | 'female';
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  result: AnalysisResult;
}

export interface ArchivedChat {
  id: string;
  personaId: string;
  timestamp: string;
  messages: ChatMessage[];
}

export interface User {
  username: string;
  role: 'admin' | 'user';
  name: string;
}
