import { motion } from "framer-motion";
import suzzyAvatar from "@/assets/suzzy-avatar.png";

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isLoading: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AIAvatar({ isSpeaking, isListening, isLoading, size = "md" }: AIAvatarProps) {
  const sizes = {
    sm: { outer: 40, inner: 36, glow: 44 },
    md: { outer: 56, inner: 48, glow: 60 },
    lg: { outer: 88, inner: 80, glow: 96 },
    xl: { outer: 140, inner: 128, glow: 156 },
  };
  const s = sizes[size];

  return (
    <div className="relative flex items-center justify-center">
      {/* Multi-layered breathing glow rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: s.glow + i * 20, height: s.glow + i * 20 }}
          animate={
            isSpeaking
              ? {
                  scale: [1, 1.15 - i * 0.03, 1],
                  opacity: [0.08, 0.35 - i * 0.08, 0.08],
                  boxShadow: [
                    `0 0 ${20 + i * 10}px ${6 + i * 3}px hsl(350 40% 55% / ${0.12 - i * 0.03})`,
                    `0 0 ${36 + i * 14}px ${12 + i * 5}px hsl(350 40% 55% / ${0.4 - i * 0.1})`,
                    `0 0 ${20 + i * 10}px ${6 + i * 3}px hsl(350 40% 55% / ${0.12 - i * 0.03})`,
                  ],
                }
              : isListening
              ? {
                  scale: [1, 1.06, 1],
                  opacity: [0.06, 0.2 - i * 0.05, 0.06],
                  boxShadow: [
                    `0 0 14px 4px hsl(38 50% 58% / 0.06)`,
                    `0 0 24px 8px hsl(38 50% 58% / 0.2)`,
                    `0 0 14px 4px hsl(38 50% 58% / 0.06)`,
                  ],
                }
              : {
                  scale: [1, 1.02, 1],
                  opacity: [0.03, 0.08, 0.03],
                  boxShadow: [
                    `0 0 8px 2px hsl(350 40% 55% / 0.03)`,
                    `0 0 14px 4px hsl(350 40% 55% / 0.08)`,
                    `0 0 8px 2px hsl(350 40% 55% / 0.03)`,
                  ],
                }
          }
          transition={{
            duration: isSpeaking ? 0.6 + i * 0.1 : isListening ? 2 : 4,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Outer ring with pulse */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: s.outer,
          height: s.outer,
          borderColor: isSpeaking
            ? "hsl(350 40% 55% / 0.5)"
            : isListening
            ? "hsl(38 50% 58% / 0.3)"
            : "hsl(350 40% 55% / 0.1)",
        }}
        animate={
          isSpeaking
            ? {
                borderColor: ["hsl(350 40% 55% / 0.25)", "hsl(350 40% 55% / 0.6)", "hsl(350 40% 55% / 0.25)"],
                scale: [1, 1.03, 1],
              }
            : {
                scale: [1, 1.01, 1],
              }
        }
        transition={{ duration: isSpeaking ? 0.7 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Avatar container with subtle idle animations */}
      <motion.div
        className="relative z-10 rounded-full overflow-hidden"
        style={{
          width: s.inner,
          height: s.inner,
          boxShadow: isSpeaking
            ? "0 0 30px 8px hsl(350 40% 55% / 0.25)"
            : "0 0 15px 4px hsl(350 40% 55% / 0.08)",
        }}
        animate={
          isLoading
            ? { opacity: [1, 0.6, 1] }
            : isSpeaking
            ? { scale: [1, 1.04, 1.02, 1.05, 1] }
            : { scale: [1, 1.008, 1] }
        }
        transition={
          isLoading
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : isSpeaking
            ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <img src={suzzyAvatar} alt="Suzzy" className="w-full h-full object-cover" />

        {/* Warm skin glow overlay */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 40% 35%, hsl(38 50% 58% / 0.08), transparent 60%)",
          }}
          animate={
            isSpeaking
              ? { opacity: [0.5, 1, 0.5] }
              : { opacity: [0.3, 0.5, 0.3] }
          }
          transition={{ duration: isSpeaking ? 0.8 : 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Lip movement simulation overlay - appears during speaking */}
        {isSpeaking && (
          <motion.div
            className="absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
            style={{
              width: "35%",
              height: "8%",
              background: "radial-gradient(ellipse, hsl(350 40% 45% / 0.15), transparent 70%)",
            }}
            animate={{
              scaleY: [1, 1.6, 0.8, 1.4, 1],
              scaleX: [1, 0.95, 1.05, 0.97, 1],
              opacity: [0.3, 0.6, 0.2, 0.5, 0.3],
            }}
            transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Blink simulation - subtle eye darkening */}
        <motion.div
          className="absolute top-[28%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "60%",
            height: "6%",
            background: "linear-gradient(180deg, hsl(0 0% 10% / 0.3), transparent)",
            borderRadius: "50%",
          }}
          animate={{
            opacity: [0, 0, 0, 0, 0, 0.7, 0, 0, 0, 0],
            scaleY: [0, 0, 0, 0, 0, 1.5, 0, 0, 0, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.15, 0.3, 0.45, 0.48, 0.5, 0.52, 0.65, 0.8, 1],
          }}
        />
      </motion.div>

      {/* Status dot */}
      <motion.div
        className="absolute z-20 rounded-full border-2 border-background"
        style={{
          width: size === "xl" ? 16 : size === "lg" ? 14 : 10,
          height: size === "xl" ? 16 : size === "lg" ? 14 : 10,
          bottom: size === "xl" ? 8 : size === "lg" ? 4 : 0,
          right: size === "xl" ? 8 : size === "lg" ? 4 : 0,
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
            ? { scale: [1, 1.4, 1] }
            : {}
        }
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
