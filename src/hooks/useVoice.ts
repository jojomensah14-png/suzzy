import { useState, useCallback, useRef, useEffect } from "react";

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
}

export function useVoice(): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const shouldRestartRef = useRef(false);

  // Pre-load voices
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

    // Stop any existing recognition first
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
      recognition.lang = "en-US";

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
  }, [isMuted]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    if (isMuted) {
      onDone?.();
      return;
    }

    // Stop listening while speaking to prevent feedback
    stopListening();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;

    // Pick a nice female voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Moira") ||
        v.name.includes("Google UK English Female") ||
        v.name.includes("Microsoft Zira") ||
        (v.lang === "en-US" && v.name.toLowerCase().includes("female"))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onDone?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onDone?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, stopListening]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

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
    error,
  };
}
