import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Mic, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CameraView } from "@/components/CameraView";
import { AIAvatar } from "@/components/AIAvatar";
import { SessionControls } from "@/components/SessionControls";
import { ChatPanel } from "@/components/ChatPanel";
import { FaceStatusBar } from "@/components/FaceStatusBar";
import { MainMenu } from "@/components/MainMenu";
import { useCamera } from "@/hooks/useCamera";
import { useVoice } from "@/hooks/useVoice";
import { useMakeupCoach } from "@/hooks/useMakeupCoach";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import suzzyIcon from "@/assets/suzzy-icon.png";

export default function SessionPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { language, t } = useLanguage();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [showVoiceGate, setShowVoiceGate] = useState(false);
  const isSessionActiveRef = useRef(false);
  const isMutedRef = useRef(false);

  const { videoRef, canvasRef, isStreaming, faceContext, startCamera, stopCamera, error: cameraError } = useCamera();
  const {
    isListening, transcript, isSpeaking, startListening, stopListening,
    speak, stopSpeaking, isMuted, toggleMute, error: voiceError,
    isPremiumVoice, setUsePremiumVoice,
  } = useVoice(language);
  const { messages, isLoading, sendMessage, error: coachError } = useMakeupCoach();
  const lastTranscriptRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const processingRef = useRef(false);

  const isPremiumUser = profile?.subscription_tier === "premium" || profile?.subscription_tier === "vip";

  // Auto-enable premium voice for premium users
  useEffect(() => {
    if (isPremiumUser) {
      setUsePremiumVoice(true);
    }
  }, [isPremiumUser, setUsePremiumVoice]);

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
    const greetingPrompt = profile?.name
      ? `Hey Suzzy! ${profile.name} just started a session. Welcome them back warmly by name and ask what look they're going for today. ${profile.skin_type ? `Their skin type is ${profile.skin_type}.` : ""} ${profile.skin_tone ? `Their skin tone is ${profile.skin_tone}.` : ""} Respond in ${language === "fr" ? "French" : language === "es" ? "Spanish" : language === "ar" ? "Arabic" : "English"}.`
      : `Hey Suzzy! I just started my session. Introduce yourself in your fun personality and ask what look I'm going for today. Respond in ${language === "fr" ? "French" : language === "es" ? "Spanish" : language === "ar" ? "Arabic" : "English"}.`;
    const greeting = await sendMessage(greetingPrompt, faceContext);
    if (greeting) {
      speak(greeting, () => {
        processingRef.current = false;
        if (isSessionActiveRef.current && !isMutedRef.current) startListening();
      });
    } else {
      processingRef.current = false;
      if (!isMutedRef.current) startListening();
    }
  }, [startCamera, speak, sendMessage, faceContext, startListening, profile, language]);

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

  const handleVoiceChatToggle = useCallback(() => {
    if (!isPremiumUser) {
      setShowVoiceGate(true);
      return;
    }
    setUsePremiumVoice(!isPremiumVoice);
  }, [isPremiumUser, isPremiumVoice, setUsePremiumVoice]);

  const statusLabel = isSpeaking ? t("suzzy_talking") : isListening ? t("listening") : isLoading ? t("thinking") : "";

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden relative">
      {/* Full-screen camera */}
      <div className="absolute inset-0 z-0">
        <CameraView videoRef={videoRef} canvasRef={canvasRef} isStreaming={isStreaming} />
      </div>

      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-t from-background via-background/20 to-background/40" />
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/60 via-transparent to-transparent h-28" />

      {/* Header */}
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

        <div className="flex items-center gap-2">
          {/* Premium voice badge */}
          {isSessionActive && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceChatToggle}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] transition-all ${
                isPremiumVoice && isPremiumUser
                  ? "bg-primary/20 border border-primary/30 text-primary"
                  : "surface-glass text-foreground/40"
              }`}
              title={isPremiumUser ? t("voice_chat") : t("upgrade_to_unlock")}
            >
              {isPremiumUser ? <Mic size={10} /> : <Lock size={10} />}
              {isPremiumVoice && isPremiumUser ? "HD Voice" : t("voice_chat")}
            </motion.button>
          )}
          <FaceStatusBar faceContext={faceContext} isVisible={isSessionActive && isStreaming} />
          <MainMenu />
        </div>
      </motion.header>

      {/* Suzzy floating avatar */}
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
              <h2 className="font-display text-2xl text-foreground mb-1.5">{t("hey_gorgeous")}</h2>
              <p className="font-display text-base text-primary/60 italic mb-4">{t("ready_to_glow")}</p>
              <p className="text-[11px] text-muted-foreground mb-8 leading-relaxed">
                {t("camera_mic_required")}
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleStartSession}
                className="px-8 py-3.5 rounded-full btn-rose font-medium text-sm tracking-wide"
              >
                <span className="flex items-center gap-2">
                  {t("lets_go")}
                  <Sparkles size={14} />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium voice gate modal */}
      <AnimatePresence>
        {showVoiceGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
            onClick={() => setShowVoiceGate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="surface-glass border border-border/15 rounded-2xl p-6 max-w-xs text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Mic size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-1">{t("premium_feature")}</h3>
              <p className="text-xs text-muted-foreground mb-5">{t("upgrade_to_unlock")}</p>
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground/50 mb-3">
                  Unlock Suzzy's warm, natural AI voice with HD quality and multi-language support.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setShowVoiceGate(false);
                    navigate("/pricing");
                  }}
                  className="w-full py-2.5 rounded-xl btn-rose font-medium text-sm"
                >
                  View Plans ✨
                </motion.button>
                <button
                  onClick={() => setShowVoiceGate(false)}
                  className="w-full py-2 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom area */}
      <div className="relative z-10 mt-auto flex flex-col">
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
                  placeholder={t("message_suzzy")}
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
