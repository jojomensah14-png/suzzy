import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Camera, CameraOff, PhoneOff, Sparkles } from "lucide-react";

interface SessionControlsProps {
  isSessionActive: boolean;
  isListening: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  onToggleSession: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export function SessionControls({
  isSessionActive,
  isListening,
  isMuted,
  isCameraOn,
  onToggleSession,
  onToggleMute,
  onToggleCamera,
}: SessionControlsProps) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <AnimatePresence>
        {isSessionActive && (
          <>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onToggleMute}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? "bg-destructive/15 border border-destructive/25 text-destructive"
                  : "btn-ghost"
              }`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onToggleSession}
              className="w-13 h-13 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive flex items-center justify-center transition-all shadow-soft"
              style={{ width: 52, height: 52 }}
              title="End session"
            >
              <PhoneOff size={18} />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onToggleCamera}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                !isCameraOn
                  ? "bg-destructive/15 border border-destructive/25 text-destructive"
                  : "btn-ghost"
              }`}
              title={isCameraOn ? "Camera off" : "Camera on"}
            >
              {isCameraOn ? <Camera size={16} /> : <CameraOff size={16} />}
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {!isSessionActive && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleSession}
          className="px-8 py-3.5 rounded-full btn-rose font-medium text-sm tracking-wide"
        >
          <span className="flex items-center gap-2">
            Start Session
            <Sparkles size={14} />
          </span>
        </motion.button>
      )}

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && !isMuted && isSessionActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 ml-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-primary/60 rounded-full"
                animate={{ height: [3, 12, 3] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
