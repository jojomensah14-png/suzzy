import { motion } from "framer-motion";
import suzzyAvatar from "@/assets/suzzy-avatar.png";

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
}

export function AIAvatar({ isSpeaking, isListening, isLoading }: AIAvatarProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/15"
          style={{
            width: `${72 + i * 20}px`,
            height: `${72 + i * 20}px`,
          }}
          animate={
            isSpeaking
              ? {
                  scale: [1, 1.08 + i * 0.04, 1],
                  opacity: [0.2, 0.5 - i * 0.1, 0.2],
                  borderColor: [
                    "hsl(var(--rose-pink) / 0.12)",
                    "hsl(var(--rose-pink) / 0.4)",
                    "hsl(var(--rose-pink) / 0.12)",
                  ],
                }
              : isListening
              ? {
                  scale: [1, 1.02, 1],
                  opacity: [0.12, 0.25, 0.12],
                }
              : { scale: 1, opacity: 0.08 }
          }
          transition={{
            duration: isSpeaking ? 1 : 2.5,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main avatar */}
      <motion.div
        className={`relative z-10 rounded-full overflow-hidden ${
          isSpeaking ? "glow-ring-active" : isListening ? "glow-ring" : ""
        }`}
        style={{ width: 64, height: 64 }}
        animate={
          isLoading
            ? { rotate: 360 }
            : isSpeaking
            ? { scale: [1, 1.04, 1] }
            : {}
        }
        transition={
          isLoading
            ? { duration: 2, repeat: Infinity, ease: "linear" }
            : { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary/30 shadow-luxury">
          <img src={suzzyAvatar} alt="Suzzy" className="w-full h-full object-cover" />
        </div>
      </motion.div>
    </div>
  );
}
