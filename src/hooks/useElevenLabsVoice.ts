import { useState, useCallback, useRef } from 'react';

interface TTSOptions {
  onStart?: () => void;
  onDone?: () => void;
  voiceId?: string;
}

export const useElevenLabsTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);

  const speak = useCallback(async (text, options: TTSOptions = {}) => {
    // CORRECT destructuring with curly braces
    const { onStart, onDone, voiceId = '21m00Tcm4TlvDq8ikWAM' } = options;

    if (!text?.trim()) {
      setError('No text provided');
      setIsSpeaking(false);
      return;
    }

    // API key validation
    if (!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
      setError('ElevenLabs API key is not configured');
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      setError(null);
      onStart?.();

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY, // THIS IS CRITICAL
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      await audio.play();
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onDone?.();
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setError('Failed to play audio');
        URL.revokeObjectURL(audioUrl);
        onDone?.();
      };

    } catch (err) {
      console.error("ElevenLabs TTS error:", err);
      setError(err instanceof Error ? err.message : "Voice error");
      setIsSpeaking(false);
      onDone?.();
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      audioRef.current = null;
    }
    
    setIsSpeaking(false);
  }, []);

  return { 
    isSpeaking, 
    speak, 
    stopSpeaking, 
    error 
  };
};