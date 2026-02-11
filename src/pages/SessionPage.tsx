import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
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

  const statusLabel = isSpeaking ? "Suzzy is talking…" : isListening ? "Listening to you…" : isLoading ? "Thinking…" : "";

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden relative">
      {/* Full-screen camera */}
      <div className="absolute inset-0 z-0">
        <CameraView videoRef={videoRef} canvasRef={canvasRef} isStreaming={isStreaming} />
      </div>

      {/* Dark gradient overlays for readability */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-background via-background/20 to-background/40" />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/60 via-transparent to-transparent h-28" />

      {/* Header — floating over camera */}
      <motion.header
        className="relative z-10 flex items-center justify-between px-4 md:px-5 py-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-full surface-glass flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          {isSessionActive && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20">
                <img src={suzzyIcon} alt="S" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/80 leading-none">Suzzy</p>
                {statusLabel && (
                  <motion.p
                    key={statusLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] text-primary/70 leading-none mt-0.5"
                  >
                    {statusLabel}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <FaceStatusBar faceContext={faceContext} isVisible={isSessionActive && isStreaming} />
      </motion.header>

      {/* Suzzy floating avatar — prominent, FaceTime PiP style */}
      <AnimatePresence>
        {isSessionActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="absolute top-16 right-4 z-20"
          >
            <AIAvatar
              isSpeaking={isSpeaking}
              isListening={isListening && !isMuted}
              isLoading={isLoading}
              size="lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-session welcome */}
      <AnimatePresence>
        {!isSessionActive && showPermissionPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-md"
          >
            <motion.div
              className="text-center max-w-xs px-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden animate-pulse-soft"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
              </motion.div>
              <h2 className="font-display text-2xl text-foreground mb-1.5">Hey gorgeous</h2>
              <p className="font-display text-base text-primary/60 italic mb-4">Ready to glow up?</p>
              <p className="text-[11px] text-muted-foreground mb-8 leading-relaxed">
                Suzzy uses your camera and mic to coach you in real-time. Nothing is saved or recorded.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleStartSession}
                className="px-8 py-3.5 rounded-full btn-rose font-medium text-sm tracking-wide"
              >
                <span className="flex items-center gap-2">
                  Let's Go
                  <Sparkles size={14} />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom area — chat + controls floating over camera */}
      <div className="relative z-10 mt-auto flex flex-col">
        {/* Chat messages — floating over camera like iMessage */}
        <AnimatePresence>
          {isSessionActive && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="px-4 md:px-5 mb-2 max-h-[35vh] overflow-hidden"
            >
              <ChatPanel messages={messages} isLoading={isLoading} error={coachError} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transcript overlay */}
        <AnimatePresence>
          {isListening && transcript && !processingRef.current && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="px-4 md:px-5 mb-2"
            >
              <div className="surface-glass px-4 py-2 rounded-xl text-xs text-foreground/70 text-center max-w-md mx-auto">
                🎤 {transcript}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text input + controls */}
        <motion.div
          className="px-4 md:px-5 pb-5 pt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Chat input */}
          <AnimatePresence>
            {isSessionActive && (
              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
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
                className="flex gap-2 mb-4 max-w-md mx-auto w-full"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message Suzzy…"
                  className="flex-1 surface-glass px-4 py-2.5 rounded-full text-xs text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/25 transition-all border border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !chatInput.trim()}
                  className="w-9 h-9 rounded-full btn-rose flex items-center justify-center disabled:opacity-15 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send size={13} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Session controls */}
          <div className="flex items-center justify-center">
            <SessionControls
              isSessionActive={isSessionActive}
              isListening={isListening}
              isMuted={isMuted}
              isCameraOn={isStreaming}
              onToggleSession={handleToggleSession}
              onToggleMute={toggleMute}
              onToggleCamera={handleToggleCamera}
            />
          </div>
        </motion.div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {(cameraError || voiceError) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 surface-glass px-5 py-2 rounded-lg text-[11px] text-foreground/70 max-w-xs text-center z-50"
          >
            {cameraError || voiceError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
