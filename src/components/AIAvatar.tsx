import { motion } from "framer-motion";

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
}

export function AIAvatar({ isSpeaking, isListening, isLoading }: AIAvatarProps) {
  const ringCount = 3;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow rings */}
      {Array.from({ length: ringCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/20"
          style={{
            width: `${80 + i * 24}px`,
            height: `${80 + i * 24}px`,
          }}
          animate={
            isSpeaking
              ? {
                  scale: [1, 1.1 + i * 0.05, 1],
                  opacity: [0.3, 0.6 - i * 0.1, 0.3],
                  borderColor: [
                    "hsl(var(--rose-gold) / 0.2)",
                    "hsl(var(--rose-gold) / 0.5)",
                    "hsl(var(--rose-gold) / 0.2)",
                  ],
                }
              : isListening
              ? {
                  scale: [1, 1.03, 1],
                  opacity: [0.2, 0.35, 0.2],
                }
              : { scale: 1, opacity: 0.15 }
          }
          transition={{
            duration: isSpeaking ? 1.2 : 2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Main avatar circle */}
      <motion.div
        className={`relative z-10 flex items-center justify-center rounded-full ${
          isSpeaking ? "glow-ring-active" : isListening ? "glow-ring" : ""
        }`}
        style={{ width: 72, height: 72 }}
        animate={
          isLoading
            ? { rotate: 360 }
            : isSpeaking
            ? { scale: [1, 1.05, 1] }
            : {}
        }
        transition={
          isLoading
            ? { duration: 2, repeat: Infinity, ease: "linear" }
            : { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary via-rose-gold to-warm-gold flex items-center justify-center">
          <span className="text-2xl">💋</span>
        </div>
      </motion.div>

      {/* Status label */}
      <motion.div
        className="absolute -bottom-7 whitespace-nowrap text-xs font-medium tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {isLoading ? (
          <span className="text-muted-foreground">Thinking...</span>
        ) : isSpeaking ? (
          <span className="text-gradient-rose font-semibold">Suzzy is speaking</span>
        ) : isListening ? (
          <span className="text-primary">Listening...</span>
        ) : (
          <span className="text-muted-foreground">Ready</span>
        )}
      </motion.div>
    </div>
  );
}
