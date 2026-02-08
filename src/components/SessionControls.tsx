import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Camera, CameraOff, PhoneOff } from "lucide-react";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <AnimatePresence>
        {isSessionActive && (
          <>
            {/* Mic toggle */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted
                  ? "bg-destructive/20 border border-destructive/30 text-destructive"
                  : "glass-panel text-foreground hover:bg-secondary/80"
              }`}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </motion.button>

            {/* End session (big red button) */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSession}
              className="w-14 h-14 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive flex items-center justify-center transition-all shadow-lg shadow-destructive/20"
              title="End session"
            >
              <PhoneOff size={20} />
            </motion.button>

            {/* Camera toggle */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onToggleCamera}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                !isCameraOn
                  ? "bg-destructive/20 border border-destructive/30 text-destructive"
                  : "glass-panel text-foreground hover:bg-secondary/80"
              }`}
              title={isCameraOn ? "Turn off camera" : "Turn on camera"}
            >
              {isCameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Start session button (only shown when not active) */}
      {!isSessionActive && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleSession}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-rose-gold text-primary-foreground font-semibold text-sm tracking-wide hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          Start Session ✨
        </motion.button>
      )}

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && !isMuted && isSessionActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 ml-1"
          >
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{ height: [4, 16, 4] }}
                transition={{
                  duration: 0.6,
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
