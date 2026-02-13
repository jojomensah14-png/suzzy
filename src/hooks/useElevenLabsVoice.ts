import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseElevenLabsVoiceReturn {
  isSpeaking: boolean;
  speak: (text: string, language: string, onDone?: () => void) => Promise<void>;
  stopSpeaking: () => void;
  error: string | null;
}

export function useElevenLabsVoice(): UseElevenLabsVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    async (text: string, language: string, onDone?: () => void) => {
      stopSpeaking();
      setError(null);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setError("Not authenticated");
          onDone?.();
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text, language }),
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "Voice failed" }));
          throw new Error(errData.error || `Error ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        objectUrlRef.current = audioUrl;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
          }
          onDone?.();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          onDone?.();
        };

        await audio.play();
      } catch (err) {
        console.error("ElevenLabs TTS error:", err);
        setError(err instanceof Error ? err.message : "Voice error");
        setIsSpeaking(false);
        onDone?.();
      }
    },
    [stopSpeaking]
  );

  return { isSpeaking, speak, stopSpeaking, error };
}
