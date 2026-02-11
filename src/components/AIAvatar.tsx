import { motion } from "framer-motion";
import suzzyAvatar from "@/assets/suzzy-avatar.png";

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
  size?: "sm" | "md" | "lg";
}

export function AIAvatar({ isSpeaking, isListening, isLoading, size = "md" }: AIAvatarProps) {
  const sizes = {
    sm: { outer: 40, inner: 36, glow: 44 },
    md: { outer: 56, inner: 48, glow: 60 },
    lg: { outer: 88, inner: 80, glow: 96 },
  };
  const s = sizes[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Breathing glow rings */}
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: s.glow + i * 16, height: s.glow + i * 16 }}
          animate={
            isSpeaking
              ? {
                  scale: [1, 1.12 - i * 0.04, 1],
                  opacity: [0.15, 0.4 - i * 0.1, 0.15],
                  boxShadow: [
                    `0 0 ${16 + i * 8}px ${4 + i * 2}px hsl(350 40% 55% / ${0.15 - i * 0.05})`,
                    `0 0 ${28 + i * 12}px ${8 + i * 4}px hsl(350 40% 55% / ${0.35 - i * 0.1})`,
                    `0 0 ${16 + i * 8}px ${4 + i * 2}px hsl(350 40% 55% / ${0.15 - i * 0.05})`,
                  ],
                }
              : isListening
              ? {
                  scale: [1, 1.04, 1],
                  opacity: [0.1, 0.2, 0.1],
                  boxShadow: [
                    `0 0 12px 3px hsl(38 50% 58% / 0.08)`,
                    `0 0 20px 5px hsl(38 50% 58% / 0.18)`,
                    `0 0 12px 3px hsl(38 50% 58% / 0.08)`,
                  ],
                }
              : { scale: 1, opacity: 0, boxShadow: "0 0 0px 0px transparent" }
          }
          transition={{
            duration: isSpeaking ? 0.7 : 2.5,
            repeat: Infinity,
            delay: i * 0.12,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Online ring */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: s.outer,
          height: s.outer,
          borderColor: isSpeaking
            ? "hsl(350 40% 55% / 0.4)"
            : isListening
            ? "hsl(38 50% 58% / 0.25)"
            : "hsl(350 40% 55% / 0.12)",
        }}
        animate={
          isSpeaking
            ? { borderColor: ["hsl(350 40% 55% / 0.2)", "hsl(350 40% 55% / 0.5)", "hsl(350 40% 55% / 0.2)"] }
            : {}
        }
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Avatar image */}
      <motion.div
        className="relative z-10 rounded-full overflow-hidden shadow-glow"
        style={{ width: s.inner, height: s.inner }}
        animate={
          isLoading
            ? { opacity: [1, 0.5, 1] }
            : isSpeaking
            ? { scale: [1, 1.05, 1] }
            : { scale: 1 }
        }
        transition={
          isLoading
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <img src={suzzyAvatar} alt="Suzzy" className="w-full h-full object-cover" />
      </motion.div>

      {/* Status dot */}
      <motion.div
        className="absolute z-20 rounded-full border-2 border-background"
        style={{
          width: size === "lg" ? 14 : 10,
          height: size === "lg" ? 14 : 10,
          bottom: size === "lg" ? 4 : 0,
          right: size === "lg" ? 4 : 0,
          backgroundColor: isSpeaking
            ? "hsl(350 40% 55%)"
            : isListening
            ? "hsl(38 50% 58%)"
            : isLoading
            ? "hsl(30 5% 45%)"
            : "hsl(140 50% 45%)",
        }}
        animate={
          isSpeaking || isListening
            ? { scale: [1, 1.3, 1] }
            : {}
        }
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
