import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraView } from "@/components/CameraView";
import { AIAvatar } from "@/components/AIAvatar";
import { SessionControls } from "@/components/SessionControls";
import { ChatPanel } from "@/components/ChatPanel";
import { FaceStatusBar } from "@/components/FaceStatusBar";
import { useCamera } from "@/hooks/useCamera";
import { useVoice } from "@/hooks/useVoice";
import { useMakeupCoach } from "@/hooks/useMakeupCoach";

export default function SessionPage() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const { videoRef, canvasRef, isStreaming, faceContext, startCamera, stopCamera, error: cameraError } = useCamera();
  const { isListening, transcript, isSpeaking, startListening, stopListening, speak, stopSpeaking, isMuted, toggleMute, error: voiceError } = useVoice();
  const { messages, isLoading, sendMessage, error: coachError } = useMakeupCoach();
  const lastTranscriptRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Handle transcript changes - send to AI after user pauses speaking
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current && isSessionActive) {
      lastTranscriptRef.current = transcript;
      
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      debounceRef.current = setTimeout(async () => {
        stopListening();
        const response = await sendMessage(transcript, faceContext);
        if (response) {
          speak(response);
          // Restart listening after speaking
          const speakDuration = response.length * 60; // rough estimate
          setTimeout(() => {
            if (isSessionActive && !isMuted) {
              startListening();
            }
          }, speakDuration);
        } else {
          if (!isMuted) startListening();
        }
        lastTranscriptRef.current = "";
      }, 1500);
    }
  }, [transcript, isSessionActive]);

  const handleToggleSession = useCallback(async () => {
    if (isSessionActive) {
      stopListening();
      stopSpeaking();
      stopCamera();
      setIsSessionActive(false);
    } else {
      await startCamera();
      setIsSessionActive(true);
      // Send initial greeting
      const greeting = await sendMessage(
        "Hi! I just started my makeup session. Please introduce yourself and ask what look I'm going for today.",
        faceContext
      );
      if (greeting) {
        speak(greeting);
        const speakDuration = greeting.length * 60;
        setTimeout(() => {
          if (!isMuted) startListening();
        }, speakDuration);
      } else {
        if (!isMuted) startListening();
      }
    }
  }, [isSessionActive, startCamera, stopCamera, startListening, stopListening, speak, stopSpeaking, sendMessage, faceContext, isMuted]);

  const handleToggleCamera = useCallback(() => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isStreaming, startCamera, stopCamera]);

  return (
    <div className="h-screen w-screen bg-gradient-luxe flex flex-col overflow-hidden">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-6 py-4 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-warm-gold flex items-center justify-center text-sm">
            ✨
          </div>
          <h1 className="font-display text-lg tracking-wide text-foreground">
            AI Makeup Coach
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <AIAvatar
            isSpeaking={isSpeaking}
            isListening={isListening && !isMuted}
            isLoading={isLoading}
          />
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 px-4 pb-4 min-h-0">
        {/* Camera area */}
        <div className="flex-1 relative min-h-0">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isStreaming={isStreaming}
          />
          <FaceStatusBar
            faceContext={faceContext}
            isVisible={isSessionActive && isStreaming}
          />
        </div>

        {/* Side panel on desktop */}
        <AnimatePresence>
          {isSessionActive && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full lg:w-80 glass-panel-strong p-4 rounded-2xl overflow-hidden flex flex-col"
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 tracking-wide uppercase">
                Conversation
              </h2>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatPanel
                  messages={messages}
                  isLoading={isLoading}
                  error={coachError}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls bar */}
      <motion.div
        className="flex items-center justify-center gap-4 px-6 py-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SessionControls
          isSessionActive={isSessionActive}
          isListening={isListening}
          isMuted={isMuted}
          isCameraOn={isStreaming}
          onToggleSession={handleToggleSession}
          onToggleMute={toggleMute}
          onToggleCamera={handleToggleCamera}
        />
      </motion.div>

      {/* Error toast */}
      <AnimatePresence>
        {(cameraError || voiceError) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-panel-strong px-6 py-3 rounded-xl text-sm text-foreground max-w-md text-center"
          >
            {cameraError || voiceError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
