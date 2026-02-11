import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import suzzyAvatar from "@/assets/suzzy-avatar.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app flex flex-col items-center justify-center px-6 py-16 overflow-hidden relative">
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-100 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(350 40% 55% / 0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-100 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(38 50% 58% / 0.04) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <motion.div
        className="text-center max-w-lg mx-auto relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Avatar */}
        <motion.div
          className="w-24 h-24 mx-auto mb-10 relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
        >
          <div className="w-full h-full rounded-full overflow-hidden border border-primary/20 animate-pulse-soft">
            <img src={suzzyAvatar} alt="Suzzy" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-background" />
        </motion.div>

        {/* Brand */}
        <motion.h1
          className="font-display text-6xl md:text-7xl font-medium mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <span className="text-gradient-rose">Suzzy</span>
        </motion.h1>

        <motion.p
          className="font-display text-lg text-muted-foreground italic mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Your Beauty Bestie
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground max-w-sm mx-auto mb-12 leading-relaxed font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Real-time makeup coaching powered by AI.
          Like FaceTime with your glam bestie.
        </motion.p>

        {/* CTA */}
        <motion.button
          onClick={() => navigate("/session")}
          className="group px-10 py-4 rounded-full btn-rose font-medium text-sm tracking-wide"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="flex items-center gap-2">
            Start Session
            <Sparkles size={14} />
          </span>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="absolute bottom-8 text-[11px] text-muted-foreground/30 tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Camera & microphone required · Best in Chrome
      </motion.p>
    </div>
  );
};

export default Index;
