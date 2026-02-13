import { motion } from "framer-motion";
import { ArrowLeft, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, LANGUAGES } from "@/contexts/LanguageContext";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

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

        <h1 className="font-display text-3xl text-gradient-rose mb-2">{t("settings")}</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Customize your Suzzy experience.
        </p>

        <div className="space-y-6">
          {/* Language */}
          <div>
            <label className="text-xs text-muted-foreground/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Globe size={12} />
              {t("language")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    language === lang.code
                      ? "bg-primary/20 border border-primary/30 text-primary"
                      : "surface-glass border border-border/20 text-foreground/50 hover:text-foreground"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium text-xs">{lang.nativeName}</p>
                    <p className="text-[10px] opacity-60">{lang.name}</p>
                  </div>
                </motion.button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/40 mt-2">
              Changes Suzzy's voice and all text in the app.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
