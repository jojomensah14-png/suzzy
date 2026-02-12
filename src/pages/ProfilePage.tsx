import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const skinTypes = ["oily", "dry", "combination", "acne-prone", "sensitive", "normal"];
const skinTones = ["light", "medium", "dark", "deep"];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile, loading } = useAuth();
  const [name, setName] = useState("");
  const [skinType, setSkinType] = useState("");
  const [skinTone, setSkinTone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setSkinType(profile.skin_type || "");
      setSkinTone(profile.skin_tone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({
      name: name.trim().slice(0, 100),
      skin_type: skinType,
      skin_tone: skinTone,
    });
    setSaving(false);
    if (result?.error) {
      toast.error("Couldn't save changes");
    } else {
      toast.success("Profile updated ✨");
    }
  };

  if (loading) return <div className="min-h-screen bg-app" />;

  return (
    <div className="min-h-screen bg-app px-6 py-8 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-100 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(350 40% 55% / 0.05) 0%, transparent 70%)" }}
      />

      <motion.div
        className="max-w-md mx-auto relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full surface-glass flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={15} />
        </button>

        <h1 className="font-display text-3xl text-gradient-rose mb-2">Your Profile</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Help Suzzy give you the best advice by telling her about yourself.
        </p>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="What should Suzzy call you?"
              className="w-full surface-glass px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/35 focus:outline-none focus:border-primary/25 border border-transparent transition-all"
            />
          </div>

          {/* Skin Type */}
          <div>
            <label className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-2 block">Skin Type</label>
            <div className="flex flex-wrap gap-2">
              {skinTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSkinType(skinType === type ? "" : type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs capitalize transition-all ${
                    skinType === type
                      ? "bg-primary/20 border border-primary/30 text-primary"
                      : "surface-glass border border-border/20 text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div>
            <label className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-2 block">Skin Tone</label>
            <div className="flex flex-wrap gap-2">
              {skinTones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSkinTone(skinTone === tone ? "" : tone)}
                  className={`px-3.5 py-1.5 rounded-full text-xs capitalize transition-all ${
                    skinTone === tone
                      ? "bg-primary/20 border border-primary/30 text-primary"
                      : "surface-glass border border-border/20 text-foreground/50 hover:text-foreground"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Subscription */}
          <div>
            <label className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-1.5 block">Plan</label>
            <div className="surface-glass px-4 py-3 rounded-xl text-sm text-foreground/60 flex items-center justify-between">
              <span className="capitalize">{profile?.subscription_tier || "free"}</span>
              <button
                onClick={() => navigate("/pricing")}
                className="text-xs text-primary/70 hover:text-primary transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl btn-rose font-medium text-sm tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
