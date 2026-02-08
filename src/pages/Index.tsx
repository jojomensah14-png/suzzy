import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Camera, Mic, Wand2, Star } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: <Camera size={20} />,
    title: "Live Camera",
    description: "Real-time face tracking with visual makeup guides",
  },
  {
    icon: <Mic size={20} />,
    title: "Voice Coaching",
    description: "Speak naturally — no typing needed",
  },
  {
    icon: <Wand2 size={20} />,
    title: "Smart Guidance",
    description: "AI reacts to your face position, lighting & blending",
  },
  {
    icon: <Star size={20} />,
    title: "Pro Techniques",
    description: "Learn contouring, eyeshadow, liner & more",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-luxe flex flex-col items-center justify-center px-6 py-12 overflow-hidden relative">
      {/* Background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(var(--rose-gold) / 0.3) 0%, transparent 70%)"
        }}
      />

      {/* Hero */}
      <motion.div
        className="text-center max-w-2xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary via-rose-gold to-warm-gold flex items-center justify-center animate-pulse-glow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <Sparkles size={32} className="text-primary-foreground" />
        </motion.div>

        <motion.h1
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-gradient-rose">AI Makeup</span>
          <br />
          <span className="text-foreground">Coach</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Your personal AI makeup artist. Real-time voice coaching while you apply — like FaceTime with a pro.
        </motion.p>

        {/* CTA */}
        <motion.button
          onClick={() => navigate("/session")}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-rose-gold text-primary-foreground font-semibold text-base tracking-wide hover:shadow-xl hover:shadow-primary/20 transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Start Your Session ✨
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
            className="glass-panel p-5 text-center group hover:bg-secondary/40 transition-colors cursor-default"
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
          >
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              {feature.icon}
            </div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-1">
              {feature.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        className="mt-16 text-xs text-muted-foreground/50 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        Requires camera & microphone access • Works best in Chrome
      </motion.p>
    </div>
  );
};

export default Index;
