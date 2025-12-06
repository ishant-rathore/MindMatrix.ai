
import { GoogleGenAI, Type, Content, Modality } from "@google/genai";
import { AnalysisResult, ResourceItem, Coordinates, Persona, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the analysis response
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    mood: { type: Type.STRING, description: "A one or two word description of the user's emotional state (e.g. Anxious, Calm, Frustrated)" },
    stressLevel: { type: Type.INTEGER, description: "A number from 1 to 10 indicating estimated stress level" },
    summary: { type: Type.STRING, description: "A compassionate, brief summary of the user's input and feelings." },
    assistantReply: { type: Type.STRING, description: "A short, empathetic, conversational reply directly to the user in their selected language. (Max 2 sentences)" },
    riskFlag: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Risk level indicating self-harm or crisis." },
    copingStrategies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-5 actionable, simple coping strategies tailored to the user's situation, in the selected language.",
    },
  },
  required: ["mood", "stressLevel", "summary", "copingStrategies", "assistantReply", "riskFlag"],
};

export const analyzeWellBeing = async (
  textInput: string,
  audioBase64?: string,
  language: Language = 'en'
): Promise<AnalysisResult> => {
  try {
    const parts: any[] = [];
    
    if (audioBase64) {
      parts.push({
        inlineData: {
          mimeType: "audio/webm;codecs=opus", // Common browser recording format
          data: audioBase64,
        },
      });
      parts.push({
        text: "Please analyze the tone, pitch, and content of this audio entry.",
      });
    }

    if (textInput) {
      parts.push({ text: textInput });
    }

    // Fallback if empty
    if (parts.length === 0) {
      throw new Error("No input provided");
    }

    const langName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        systemInstruction: `You are MindMatrix.ai, an empathetic mental-wellbeing assistant. 
        
        Your Task:
        1. Analyze the user's input (text or audio) for mood, stress, and risk.
        2. Respond in ${langName}.
        3. Acknowledge how they feel warmly.
        4. Suggest one small, practical next step.
        5. Use simple, clear sentences a teenager can understand.
        6. Determine a risk flag: 'high' if self-harm/suicide is mentioned, 'medium' for severe distress, 'low' otherwise.
        `,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const findLocalResources = async (coords: Coordinates): Promise<{ resources: ResourceItem[], advice: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: "Find 3-5 highly rated mental health clinics, support groups, or therapists near the provided location. Provide a brief encouraging sentence before listing them.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude,
            },
          },
        },
      },
    });

    const resources: ResourceItem[] = [];
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          resources.push({
            title: chunk.web.title || "Web Result",
            uri: chunk.web.uri,
            source: "web"
          });
        }
      });
    }
    
    return {
      resources,
      advice: response.text || "Here are some resources found nearby."
    };
  } catch (error) {
    console.error("Resource Search Error:", error);
    return { resources: [], advice: "We couldn't reach the map service right now, but please look for local specialists in your area." };
  }
};

export const detectSentimentEmoji = async (text: string): Promise<string> => {
  try {
    // Use Gemini Flash Lite for simple text tasks to ensure reliability and speed
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Analyze the sentiment of this text and return ONLY a single emoji that best represents it. Do not add any text. Text: "${text}"`,
    });
    const emoji = response.text?.trim() || "😐";
    // Ensure we just get an emoji-like character if possible
    return emoji.substring(0, 2); 
  } catch (e) {
    return "😐";
  }
};

export const transcribeAudio = async (audioBase64: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "audio/webm;codecs=opus",
              data: audioBase64,
            },
          },
          {
            text: "Transcribe the spoken audio into text. Return ONLY the transcription, no additional commentary.",
          },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        role: "user",
        parts: [{ text: text }],
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const createChatSession = (persona: Persona, location?: Coordinates, history?: Content[]) => {
  // Use Gemini 2.5 Flash Lite for fast, low-latency chat sessions
  // While respecting the persona system instructions
  
  return ai.chats.create({
    model: "gemini-2.5-flash-lite", 
    history: history, 
    config: {
      systemInstruction: `${persona.systemInstruction} 
      
      Important Rules:
      1. Keep responses concise and conversational.
      2. Always maintain the persona's specific tone.
      3. EMOTIONAL REACTION: Start EVERY response with a sentiment emoji wrapped in double curly braces, like {{😊}}, {{😢}}, {{😠}}, or {{🤔}}. This emoji represents your current facial expression or reaction to the user. Example: "{{👍}} That sounds great!" or "{{😟}} I am sorry to hear that."
      `,
    },
  });
};
