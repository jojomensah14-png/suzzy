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
      {/* Glow ring */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 56, height: 56 }}
        animate={
          isSpeaking
            ? { boxShadow: [
                "0 0 20px 4px hsl(350 40% 55% / 0.2)",
                "0 0 35px 8px hsl(350 40% 55% / 0.35)",
                "0 0 20px 4px hsl(350 40% 55% / 0.2)",
              ] }
            : isListening
            ? { boxShadow: [
                "0 0 12px 3px hsl(38 50% 58% / 0.1)",
                "0 0 20px 5px hsl(38 50% 58% / 0.2)",
                "0 0 12px 3px hsl(38 50% 58% / 0.1)",
              ] }
            : { boxShadow: "0 0 0px 0px transparent" }
        }
        transition={{ duration: isSpeaking ? 0.8 : 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Avatar */}
      <motion.div
        className="relative z-10 rounded-full overflow-hidden"
        style={{ width: 48, height: 48 }}
        animate={
          isLoading
            ? { opacity: [1, 0.6, 1] }
            : isSpeaking
            ? { scale: [1, 1.03, 1] }
            : {}
        }
        transition={
          isLoading
            ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="w-full h-full rounded-full overflow-hidden border border-primary/20">
          <img src={suzzyAvatar} alt="Suzzy" className="w-full h-full object-cover" />
        </div>
      </motion.div>
    </div>
  );
}
