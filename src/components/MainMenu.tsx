import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Menu, X, User, Settings, CreditCard, History, LogOut, HelpCircle, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import suzzyAvatar from "@/assets/suzzy-avatar.png";

export function MainMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { t, languageInfo } = useLanguage();

  if (!user) return null;

  const menuItems = [
    { icon: User, label: t("profile"), path: "/profile" },
    { icon: Settings, label: t("settings"), path: "/settings" },
    { icon: CreditCard, label: t("subscription"), path: "/pricing" },
    { icon: History, label: t("beauty_history"), path: "/history" },
    { icon: HelpCircle, label: t("help"), path: "/" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 rounded-full surface-glass flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
      >
        <Menu size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-card/95 backdrop-blur-xl border-l border-border/15 z-50 flex flex-col"
            >
              {/* Header with avatar */}
              <div className="px-5 py-5 flex items-center gap-3 border-b border-border/10">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-primary/20">
                  <img src={suzzyAvatar} alt="Suzzy" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{profile?.name || "Beauty Lover"}</p>
                  <p className="text-[10px] text-muted-foreground/50 capitalize">{profile?.subscription_tier || "free"} plan</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full surface-glass flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Language badge */}
              <div className="px-5 py-2.5 border-b border-border/10">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/settings");
                  }}
                  className="flex items-center gap-2 text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <Globe size={12} />
                  <span>{languageInfo.flag} {languageInfo.nativeName}</span>
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 py-3 px-3">
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(item.path);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground/60 hover:text-foreground hover:bg-white/[0.03] transition-all"
                  >
                    <item.icon size={16} />
                    {item.label}
                  </motion.button>
                ))}
              </div>

              {/* Logout */}
              <div className="px-3 pb-5 pt-2 border-t border-border/10">
                <button
                  onClick={async () => {
                    setIsOpen(false);
                    await signOut();
                    navigate("/auth");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                  <LogOut size={16} />
                  {t("sign_out")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
