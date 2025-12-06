
import { AnalysisResult, ChatMessage, HistoryItem, ArchivedChat } from '../types';

const KEYS = {
  ANALYSIS_HISTORY: 'mindmatrix_analysis_history',
  CHAT_PREFIX: 'mindmatrix_chat_',
  CHAT_ARCHIVE_PREFIX: 'mindmatrix_chat_archive_',
};

/**
 * MOCK BACKEND SERVICE
 * Handles data persistence using LocalStorage
 */

export const storage = {
  // --- ANALYSIS HISTORY ---

  saveAnalysis: (result: AnalysisResult): HistoryItem => {
    const history = storage.getHistory();
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      result,
    };
    
    // Add to beginning of array
    const updatedHistory = [newItem, ...history];
    localStorage.setItem(KEYS.ANALYSIS_HISTORY, JSON.stringify(updatedHistory));
    return newItem;
  },

  getHistory: (): HistoryItem[] => {
    const data = localStorage.getItem(KEYS.ANALYSIS_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  deleteHistoryItem: (id: string) => {
    const history = storage.getHistory();
    const updated = history.filter(item => item.id !== id);
    localStorage.setItem(KEYS.ANALYSIS_HISTORY, JSON.stringify(updated));
    return updated;
  },

  clearHistory: () => {
    localStorage.removeItem(KEYS.ANALYSIS_HISTORY);
  },

  // --- CHAT HISTORY ---

  saveChatMessage: (personaId: string, message: ChatMessage) => {
    const messages = storage.getChatMessages(personaId);
    // Ensure timestamp is string for storage
    const msgToSave = { ...message, timestamp: message.timestamp.toString() };
    const updated = [...messages, msgToSave];
    localStorage.setItem(`${KEYS.CHAT_PREFIX}${personaId}`, JSON.stringify(updated));
  },

  getChatMessages: (personaId: string): ChatMessage[] => {
    const data = localStorage.getItem(`${KEYS.CHAT_PREFIX}${personaId}`);
    if (!data) return [];
    
    // Parse back dates
    return JSON.parse(data).map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  },

  /**
   * Archives the current chat session for a persona and clears the active chat.
   */
  archiveChat: (personaId: string) => {
    const currentMessages = storage.getChatMessages(personaId);
    
    // Don't archive if empty or only has the welcome message (approx check)
    if (currentMessages.length <= 1) {
       localStorage.removeItem(`${KEYS.CHAT_PREFIX}${personaId}`);
       return;
    }

    const archiveKey = `${KEYS.CHAT_ARCHIVE_PREFIX}${personaId}`;
    const existingArchiveRaw = localStorage.getItem(archiveKey);
    const existingArchive: ArchivedChat[] = existingArchiveRaw ? JSON.parse(existingArchiveRaw) : [];

    // Prevent duplicate archives (e.g. if user just viewed an archive and left without changes)
    if (existingArchive.length > 0) {
        const lastArchive = existingArchive[0];
        const lastMsgCurrent = currentMessages[currentMessages.length - 1];
        const lastMsgArchive = lastArchive.messages[lastArchive.messages.length - 1];
        
        // If message counts match and last message ID matches, assume it's the same session unmodified
        if (currentMessages.length === lastArchive.messages.length && 
            lastMsgCurrent.id === lastMsgArchive.id) {
             // It's identical to the top archive, just clear active state
             localStorage.removeItem(`${KEYS.CHAT_PREFIX}${personaId}`);
             return;
        }
    }

    const newArchiveEntry: ArchivedChat = {
      id: Date.now().toString(),
      personaId: personaId,
      timestamp: new Date().toISOString(),
      messages: currentMessages
    };

    // Add to top of archive
    const updatedArchive = [newArchiveEntry, ...existingArchive];
    localStorage.setItem(archiveKey, JSON.stringify(updatedArchive));

    // Clear active chat
    localStorage.removeItem(`${KEYS.CHAT_PREFIX}${personaId}`);
  },

  getArchivedChats: (personaId: string): ArchivedChat[] => {
    const data = localStorage.getItem(`${KEYS.CHAT_ARCHIVE_PREFIX}${personaId}`);
    return data ? JSON.parse(data) : [];
  },

  restoreActiveChat: (personaId: string, messages: ChatMessage[]) => {
    localStorage.setItem(`${KEYS.CHAT_PREFIX}${personaId}`, JSON.stringify(messages));
  },

  clearChat: (personaId: string) => {
    localStorage.removeItem(`${KEYS.CHAT_PREFIX}${personaId}`);
  }
};
