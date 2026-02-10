import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Info, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CameraView } from "@/components/CameraView";
import { AIAvatar } from "@/components/AIAvatar";
import { SessionControls } from "@/components/SessionControls";
import { ChatPanel } from "@/components/ChatPanel";
import { FaceStatusBar } from "@/components/FaceStatusBar";
import { useCamera } from "@/hooks/useCamera";
import { useVoice } from "@/hooks/useVoice";
import { useMakeupCoach } from "@/hooks/useMakeupCoach";
import suzzyIcon from "@/assets/suzzy-icon.png";

export default function SessionPage() {
  const navigate = useNavigate();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const isSessionActiveRef = useRef(false);
  const isMutedRef = useRef(false);

  const { videoRef, canvasRef, isStreaming, faceContext, startCamera, stopCamera, error: cameraError } = useCamera();
  const { isListening, transcript, isSpeaking, startListening, stopListening, speak, stopSpeaking, isMuted, toggleMute, error: voiceError } = useVoice();
  const { messages, isLoading, sendMessage, error: coachError } = useMakeupCoach();
  const lastTranscriptRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const processingRef = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Handle transcript changes — send to AI after user pauses
  useEffect(() => {
    if (!transcript || transcript === lastTranscriptRef.current || !isSessionActive || processingRef.current) return;

    lastTranscriptRef.current = transcript;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!isSessionActiveRef.current || processingRef.current) return;
      processingRef.current = true;
      stopListening();

      const response = await sendMessage(transcript, faceContext);
      lastTranscriptRef.current = "";
      
      if (response && isSessionActiveRef.current) {
        speak(response, () => {
          processingRef.current = false;
          if (isSessionActiveRef.current && !isMutedRef.current) {
            startListening();
          }
        });
      } else {
        processingRef.current = false;
        if (isSessionActiveRef.current && !isMutedRef.current) {
          startListening();
        }
      }
    }, 1800);
  }, [transcript, isSessionActive]);

  const handleStartSession = useCallback(async () => {
    setShowPermissionPrompt(false);
    try {
      // Request mic permission alongside camera
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Voice will show its own error
    }

    await startCamera();
    setIsSessionActive(true);
    processingRef.current = true;

    const greeting = await sendMessage(
      "Hey Suzzy! I just started my session. Introduce yourself in your fun personality and ask what look I'm going for today.",
      faceContext
    );

    if (greeting) {
      speak(greeting, () => {
        processingRef.current = false;
        if (isSessionActiveRef.current && !isMutedRef.current) {
          startListening();
        }
      });
    } else {
      processingRef.current = false;
      if (!isMutedRef.current) startListening();
    }
  }, [startCamera, speak, sendMessage, faceContext, startListening]);

  const handleEndSession = useCallback(() => {
    stopListening();
    stopSpeaking();
    stopCamera();
    setIsSessionActive(false);
    processingRef.current = false;
  }, [stopListening, stopSpeaking, stopCamera]);

  const handleToggleSession = useCallback(() => {
    if (isSessionActive) {
      handleEndSession();
    } else {
      handleStartSession();
    }
  }, [isSessionActive, handleStartSession, handleEndSession]);

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
        className="flex items-center justify-between px-4 md:px-6 py-3 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-luxury"
            title="Back to home"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 shadow-luxury">
            <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display text-base tracking-wide text-foreground leading-tight">
              Suzzy
            </h1>
            <span className="text-[10px] text-muted-foreground font-sans leading-tight tracking-wide">
              {isSessionActive
                ? isSpeaking ? "Speaking..." : isListening ? "Listening to you..." : isLoading ? "Thinking..." : "Ready"
                : "Your AI Beauty Assistant"}
            </span>
          </div>
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
      <div className="flex-1 flex flex-col lg:flex-row gap-3 px-3 md:px-4 pb-3 min-h-0">
        {/* Camera area */}
        <div className="flex-1 relative min-h-0 rounded-2xl overflow-hidden">
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isStreaming={isStreaming}
          />
          <FaceStatusBar
            faceContext={faceContext}
            isVisible={isSessionActive && isStreaming}
          />

          {/* Pre-session welcome overlay */}
          <AnimatePresence>
            {!isSessionActive && showPermissionPrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl z-10"
              >
                <div className="text-center max-w-sm px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/30 animate-pulse-glow shadow-luxury-lg">
                    <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="font-display text-2xl text-foreground mb-2">Ready to glow up?</h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    Suzzy needs your <strong className="text-foreground">camera</strong> and <strong className="text-foreground">microphone</strong> to coach you live.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/70 mt-3 mb-6">
                    <Info size={12} />
                    <span>Your video stays on your device — never recorded or stored</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartSession}
                    className="px-8 py-3.5 rounded-full btn-luxury text-primary-foreground font-semibold text-sm tracking-wide"
                  >
                    Let's Go, Suzzy! 💅
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current transcript overlay */}
          <AnimatePresence>
            {isListening && transcript && !processingRef.current && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 z-10"
              >
                <div className="glass-panel-strong px-4 py-2.5 rounded-xl text-sm text-foreground/90 text-center">
                  🎤 {transcript}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side panel */}
        <AnimatePresence>
        {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: "auto" }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full lg:w-80 glass-panel-strong p-4 rounded-2xl overflow-hidden flex flex-col max-h-[30vh] lg:max-h-full"
            >
              <h2 className="text-xs font-medium text-muted-foreground mb-3 tracking-widest uppercase flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Conversation
              </h2>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatPanel
                  messages={messages}
                  isLoading={isLoading}
                  error={coachError}
                />
              </div>
              {/* Text chat input */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const text = chatInput.trim();
                  if (!text || isLoading) return;
                  setChatInput("");
                  stopListening();
                  processingRef.current = true;
                  const response = await sendMessage(text, faceContext);
                  if (response && isSessionActiveRef.current) {
                    speak(response, () => {
                      processingRef.current = false;
                      if (isSessionActiveRef.current && !isMutedRef.current) {
                        startListening();
                      }
                    });
                  } else {
                    processingRef.current = false;
                    if (isSessionActiveRef.current && !isMutedRef.current) {
                      startListening();
                    }
                  }
                }}
                className="flex gap-2 mt-3 pt-3 border-t border-primary/10"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background/40 border border-primary/15 rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !chatInput.trim()}
                  className="w-9 h-9 rounded-full btn-luxury text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls bar */}
      <motion.div
        className="flex items-center justify-center gap-4 px-4 py-4 md:py-5"
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-panel-strong px-6 py-3 rounded-xl text-sm text-foreground max-w-md text-center z-50"
          >
            ⚠️ {cameraError || voiceError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
