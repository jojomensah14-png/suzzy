import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send } from "lucide-react";
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

  useEffect(() => { isSessionActiveRef.current = isSessionActive; }, [isSessionActive]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

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
          if (isSessionActiveRef.current && !isMutedRef.current) startListening();
        });
      } else {
        processingRef.current = false;
        if (isSessionActiveRef.current && !isMutedRef.current) startListening();
      }
    }, 1800);
  }, [transcript, isSessionActive]);

  const handleStartSession = useCallback(async () => {
    setShowPermissionPrompt(false);
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch {}
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
        if (isSessionActiveRef.current && !isMutedRef.current) startListening();
      });
    } else {
      processingRef.current = false;
      if (!isMutedRef.current) startListening();
    }
  }, [startCamera, speak, sendMessage, faceContext, startListening]);

  const handleEndSession = useCallback(() => {
    stopListening(); stopSpeaking(); stopCamera();
    setIsSessionActive(false);
    processingRef.current = false;
  }, [stopListening, stopSpeaking, stopCamera]);

  const handleToggleSession = useCallback(() => {
    isSessionActive ? handleEndSession() : handleStartSession();
  }, [isSessionActive, handleStartSession, handleEndSession]);

  const handleToggleCamera = useCallback(() => {
    isStreaming ? stopCamera() : startCamera();
  }, [isStreaming, startCamera, stopCamera]);

  const statusText = isSpeaking ? "Speaking…" : isListening ? "Listening…" : isLoading ? "Thinking…" : "Ready";

  return (
    <div className="h-screen w-screen bg-app flex flex-col overflow-hidden">
      {/* Header — minimal */}
      <motion.header
        className="flex items-center justify-between px-4 md:px-5 py-3 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-full btn-ghost flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/15">
              <img src={suzzyIcon} alt="S" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-sm text-foreground leading-tight">Suzzy</h1>
              {isSessionActive && (
                <span className="text-[10px] text-muted-foreground leading-tight">{statusText}</span>
              )}
            </div>
          </div>
        </div>

        {isSessionActive && (
          <AIAvatar
            isSpeaking={isSpeaking}
            isListening={isListening && !isMuted}
            isLoading={isLoading}
          />
        )}
      </motion.header>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row gap-2 px-3 md:px-4 pb-2 min-h-0">
        {/* Camera */}
        <div className="flex-1 relative min-h-0 rounded-xl overflow-hidden">
          <CameraView videoRef={videoRef} canvasRef={canvasRef} isStreaming={isStreaming} />
          <FaceStatusBar faceContext={faceContext} isVisible={isSessionActive && isStreaming} />

          {/* Permission overlay */}
          <AnimatePresence>
            {!isSessionActive && showPermissionPrompt && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-background/85 backdrop-blur-sm rounded-xl z-10"
              >
                <div className="text-center max-w-xs px-6">
                  <div className="w-14 h-14 mx-auto mb-5 rounded-full overflow-hidden border border-primary/15 animate-pulse-soft">
                    <img src={suzzyIcon} alt="S" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="font-display text-xl text-foreground mb-2">Ready to glow?</h2>
                  <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                    Suzzy needs your camera and mic to coach you live. Nothing is recorded.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartSession}
                    className="px-7 py-3 rounded-full btn-rose font-medium text-sm"
                  >
                    Let's Go 💅
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcript */}
          <AnimatePresence>
            {isListening && transcript && !processingRef.current && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute bottom-3 left-3 right-3 z-10"
              >
                <div className="surface-glass px-4 py-2 rounded-lg text-xs text-foreground/80 text-center">
                  {transcript}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat panel */}
        <AnimatePresence>
          {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full lg:w-72 surface-elevated p-3 rounded-xl overflow-hidden flex flex-col max-h-[28vh] lg:max-h-full"
            >
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatPanel messages={messages} isLoading={isLoading} error={coachError} />
              </div>
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
                      if (isSessionActiveRef.current && !isMutedRef.current) startListening();
                    });
                  } else {
                    processingRef.current = false;
                    if (isSessionActiveRef.current && !isMutedRef.current) startListening();
                  }
                }}
                className="flex gap-2 mt-2 pt-2 border-t border-border/30"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message Suzzy…"
                  className="flex-1 bg-muted/50 border border-border/40 rounded-full px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/30 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !chatInput.trim()}
                  className="w-8 h-8 rounded-full btn-rose flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <motion.div
        className="flex items-center justify-center gap-3 px-4 py-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
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

      {/* Error */}
      <AnimatePresence>
        {(cameraError || voiceError) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 surface-elevated px-5 py-2.5 rounded-lg text-xs text-foreground max-w-sm text-center z-50"
          >
            {cameraError || voiceError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
