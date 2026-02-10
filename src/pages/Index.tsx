import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Camera, Mic, Wand2, Heart, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import suzzyAvatar from "@/assets/suzzy-avatar.png";

const features = [
  {
    icon: <Camera size={20} />,
    title: "See You, Babe",
    description: "Live camera with face tracking & visual makeup guides",
  },
  {
    icon: <Mic size={20} />,
    title: "Just Talk",
    description: "No typing — speak naturally, Suzzy listens",
  },
  {
    icon: <Wand2 size={20} />,
    title: "Real-Time Tips",
    description: "Suzzy reacts to your face, lighting & blending live",
  },
  {
    icon: <Heart size={20} />,
    title: "Pro Looks",
    description: "Contouring, eyeshadow, liner & more — step by step",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-luxe flex flex-col items-center justify-center px-6 py-12 overflow-hidden relative">
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
      </div>

      {/* Background glow orbs */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-15 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--rose-pink) / 0.35) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--champagne) / 0.3) 0%, transparent 65%)",
        }}
      />

      {/* Hero */}
      <motion.div
        className="text-center max-w-2xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Suzzy avatar */}
        <motion.div
          className="w-28 h-28 mx-auto mb-8 rounded-full animate-pulse-glow relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, delay: 0.2 }}
        >
          <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary/40 shadow-luxury-lg">
            <img src={suzzyAvatar} alt="Suzzy" className="w-full h-full object-cover" />
          </div>
          {/* Online dot */}
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-luxury" />
        </motion.div>

        {/* Greeting tag */}
        <motion.div
          className="inline-flex items-center gap-1.5 mb-6 px-5 py-2 rounded-full glass-panel text-xs font-medium tracking-widest uppercase text-primary shadow-luxury"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Sparkles size={12} />
          Hey gorgeous, I'm ready
        </motion.div>

        <motion.h1
          className="font-display text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-gradient-rose">Suzzy</span>
        </motion.h1>

        <motion.p
          className="font-display text-xl md:text-2xl text-foreground/60 italic mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          Your AI Beauty Assistant
        </motion.p>

        <motion.p
          className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-12 leading-relaxed font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Like FaceTime with your glam bestie — Suzzy watches, coaches, and hypes you up while you slay your look.
        </motion.p>

        {/* CTA */}
        <motion.button
          onClick={() => navigate("/session")}
          className="group px-12 py-4.5 rounded-full btn-luxury text-primary-foreground font-semibold text-base tracking-wide relative overflow-hidden"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Hey Suzzy, Let's Glow
            <Sparkles size={16} />
          </span>
        </motion.button>
      </motion.div>

      {/* Features */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-3xl w-full relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="glass-panel p-5 text-center group cursor-default shadow-luxury hover:shadow-luxury-lg transition-all duration-300"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 group-hover:shadow-luxury transition-all duration-300">
              {feature.icon}
            </div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-1">
              {feature.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        className="mt-16 text-xs text-muted-foreground/40 text-center font-light tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        Requires camera & microphone · Works best in Chrome · Made with 💋 by Suzzy
      </motion.p>
    </div>
  );
};

export default Index;
