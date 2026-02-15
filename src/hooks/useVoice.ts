import { useState, useCallback, useEffect } from "react";
import { useElevenLabsTTS } from "./useElevenLabsVoice";

export function cleanForVoice(text: string) {
  return text.replace(/[*_~`#]/g, "");
}

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  stopSpeaking: () => void;
}

export function useVoice(text: string): UseVoiceReturn {
  const { speak, stopSpeaking: stopTTS } = useElevenLabsTTS();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");

  const cleanText = cleanForVoice(text);

  const startListening = useCallback(() => {
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    stopTTS();
    setIsSpeaking(false);
  }, [stopTTS]);

  const speakText = useCallback(() => {
    if (!cleanText) return;
    setIsSpeaking(true);
    speak(cleanText);
  }, [cleanText, speak]);

  useEffect(() => {
    if (cleanText) {
      speakText();
    }
  }, [cleanText, speakText]);

  return {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    stopSpeaking,
  };
}