import { useState, useCallback, useRef, useEffect } from "react";
import { useElevenLabsVoice } from "./useElevenLabsVoice";

interface UseVoiceReturn {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, onDone?: () => void) => void;
  stopSpeaking: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  error: string | null;
  isPremiumVoice: boolean;
  setUsePremiumVoice: (use: boolean) => void;
}

export function useVoice(language: string = "en"): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumVoice, setUsePremiumVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);

  const elevenLabs = useElevenLabsVoice();

  const isSpeaking = isPremiumVoice ? elevenLabs.isSpeaking : isSpeakingLocal;

  // Speech language mapping
  const speechLangMap: Record<string, string> = {
    en: "en-US",
    fr: "fr-FR",
    es: "es-ES",
    pt: "pt-BR",
    ar: "ar-SA",
  };

  // Pre-load browser voices
  useEffect(() => {
    window.speechSynthesis.getVoices();
    const handleVoices = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", handleVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handleVoices);
      if (recognitionRef.current) {
        shouldRestartRef.current = false;
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const startListening = useCallback(() => {
    if (isMuted) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLangMap[language] || "en-US";

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.trim());
        } else if (interimTranscript) {
          setTranscript(interimTranscript.trim());
        }
      };

      recognition.onend = () => {
        if (shouldRestartRef.current && !isMuted) {
          try {
            setTimeout(() => {
              if (shouldRestartRef.current) recognition.start();
            }, 100);
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "aborted" && event.error !== "no-speech") {
          console.error("Speech recognition error:", event.error);
        }
      };

      recognitionRef.current = recognition;
      shouldRestartRef.current = true;
      recognition.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError("Could not start speech recognition.");
      console.error("Speech recognition start error:", err);
    }
  }, [isMuted, language]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback(
    (text: string, onDone?: () => void) => {
      if (isMuted) {
        onDone?.();
        return;
      }

      stopListening();

      if (isPremiumVoice) {
        // Use ElevenLabs for premium voice
        elevenLabs.speak(text, language, onDone);
      } else {
        // Fallback to browser TTS
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
        utterance.lang = speechLangMap[language] || "en-US";

        const voices = window.speechSynthesis.getVoices();
        const langVoices = voices.filter((v) => v.lang.startsWith(language));
        const preferred =
          langVoices.find(
            (v) =>
              v.name.includes("Samantha") ||
              v.name.includes("Google") ||
              v.name.toLowerCase().includes("female")
          ) || langVoices[0];
        if (preferred) utterance.voice = preferred;

        utterance.onstart = () => setIsSpeakingLocal(true);
        utterance.onend = () => {
          setIsSpeakingLocal(false);
          onDone?.();
        };
        utterance.onerror = () => {
          setIsSpeakingLocal(false);
          onDone?.();
        };

        window.speechSynthesis.speak(utterance);
      }
    },
    [isMuted, stopListening, isPremiumVoice, elevenLabs, language]
  );

  const stopSpeaking = useCallback(() => {
    if (isPremiumVoice) {
      elevenLabs.stopSpeaking();
    } else {
      window.speechSynthesis.cancel();
      setIsSpeakingLocal(false);
    }
  }, [isPremiumVoice, elevenLabs]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      if (!prev) {
        stopListening();
        stopSpeaking();
      }
      return !prev;
    });
  }, [stopListening, stopSpeaking]);

  return {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isMuted,
    toggleMute,
    error: error || elevenLabs.error,
    isPremiumVoice,
    setUsePremiumVoice,
  };
}
