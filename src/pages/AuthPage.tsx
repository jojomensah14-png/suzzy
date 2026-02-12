import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import suzzyIcon from "@/assets/suzzy-icon.png";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(128);

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      setLoading(false);
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: emailResult.data,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() || undefined },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account ✨");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: emailResult.data,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || "Google sign in failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-100 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(350 40% 55% / 0.06) 0%, transparent 70%)" }}
      />

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border border-primary/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          >
            <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="font-display text-3xl text-gradient-rose mb-1">Suzzy</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Join your beauty bestie" : "Welcome back, gorgeous"}
          </p>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full surface-glass px-4 py-3 rounded-xl text-sm text-foreground/80 hover:text-foreground flex items-center justify-center gap-3 transition-all mb-4 border border-white/5 hover:border-primary/15 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-border/30" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className="w-full surface-glass px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/25 border border-transparent transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="w-full surface-glass px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/25 border border-transparent transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            maxLength={128}
            className="w-full surface-glass px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/25 border border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-rose font-medium text-sm tracking-wide disabled:opacity-50"
          >
            {loading ? "Hold on…" : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground/50 mt-5">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary/70 hover:text-primary transition-colors"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
