import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "en" | "fr" | "es" | "ar";

interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  speechLang: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", speechLang: "en-US" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", speechLang: "fr-FR" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", speechLang: "es-ES" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", speechLang: "ar-SA" },
];

type TranslationKey =
  | "welcome_back"
  | "your_beauty_bestie"
  | "start_session"
  | "get_started"
  | "message_suzzy"
  | "hey_gorgeous"
  | "ready_to_glow"
  | "camera_mic_required"
  | "lets_go"
  | "end_session"
  | "mute"
  | "unmute"
  | "camera_on"
  | "camera_off"
  | "listening"
  | "suzzy_talking"
  | "thinking"
  | "profile"
  | "settings"
  | "subscription"
  | "beauty_history"
  | "help"
  | "sign_out"
  | "language"
  | "voice_chat"
  | "premium_feature"
  | "upgrade_to_unlock"
  | "save_changes"
  | "saving";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    welcome_back: "Welcome back, {name} ✨",
    your_beauty_bestie: "Your Beauty Bestie",
    start_session: "Start Session",
    get_started: "Get Started",
    message_suzzy: "Message Suzzy…",
    hey_gorgeous: "Hey gorgeous",
    ready_to_glow: "Ready to glow up?",
    camera_mic_required: "Camera & microphone required · Best in Chrome",
    lets_go: "Let's Go",
    end_session: "End session",
    mute: "Mute",
    unmute: "Unmute",
    camera_on: "Camera off",
    camera_off: "Camera on",
    listening: "Listening to you…",
    suzzy_talking: "Suzzy is talking…",
    thinking: "Thinking…",
    profile: "Profile",
    settings: "Settings",
    subscription: "Subscription",
    beauty_history: "Beauty History",
    help: "Help",
    sign_out: "Sign Out",
    language: "Language",
    voice_chat: "Voice Chat",
    premium_feature: "Premium Feature",
    upgrade_to_unlock: "Upgrade to Premium to unlock voice chat",
    save_changes: "Save Changes",
    saving: "Saving…",
  },
  fr: {
    welcome_back: "Bon retour, {name} ✨",
    your_beauty_bestie: "Ta Meilleure Amie Beauté",
    start_session: "Démarrer la session",
    get_started: "Commencer",
    message_suzzy: "Écrire à Suzzy…",
    hey_gorgeous: "Hey ma belle",
    ready_to_glow: "Prête à briller ?",
    camera_mic_required: "Caméra et micro requis · Meilleur sur Chrome",
    lets_go: "C'est parti",
    end_session: "Terminer la session",
    mute: "Couper le micro",
    unmute: "Activer le micro",
    camera_on: "Caméra off",
    camera_off: "Caméra on",
    listening: "Je t'écoute…",
    suzzy_talking: "Suzzy parle…",
    thinking: "Réflexion…",
    profile: "Profil",
    settings: "Paramètres",
    subscription: "Abonnement",
    beauty_history: "Historique beauté",
    help: "Aide",
    sign_out: "Se déconnecter",
    language: "Langue",
    voice_chat: "Chat vocal",
    premium_feature: "Fonctionnalité Premium",
    upgrade_to_unlock: "Passez à Premium pour débloquer le chat vocal",
    save_changes: "Enregistrer",
    saving: "Enregistrement…",
  },
  es: {
    welcome_back: "Bienvenida, {name} ✨",
    your_beauty_bestie: "Tu Mejor Amiga de Belleza",
    start_session: "Iniciar sesión",
    get_started: "Comenzar",
    message_suzzy: "Escribe a Suzzy…",
    hey_gorgeous: "Hola guapa",
    ready_to_glow: "¿Lista para brillar?",
    camera_mic_required: "Cámara y micrófono requeridos · Mejor en Chrome",
    lets_go: "Vamos",
    end_session: "Terminar sesión",
    mute: "Silenciar",
    unmute: "Activar micro",
    camera_on: "Cámara off",
    camera_off: "Cámara on",
    listening: "Escuchándote…",
    suzzy_talking: "Suzzy está hablando…",
    thinking: "Pensando…",
    profile: "Perfil",
    settings: "Configuración",
    subscription: "Suscripción",
    beauty_history: "Historial de belleza",
    help: "Ayuda",
    sign_out: "Cerrar sesión",
    language: "Idioma",
    voice_chat: "Chat de voz",
    premium_feature: "Función Premium",
    upgrade_to_unlock: "Actualiza a Premium para desbloquear el chat de voz",
    save_changes: "Guardar cambios",
    saving: "Guardando…",
  },
  ar: {
    welcome_back: "مرحباً بعودتك، {name} ✨",
    your_beauty_bestie: "صديقتك في الجمال",
    start_session: "بدء الجلسة",
    get_started: "ابدأي",
    message_suzzy: "أرسلي رسالة لسوزي…",
    hey_gorgeous: "مرحباً جميلتي",
    ready_to_glow: "مستعدة للتألق؟",
    camera_mic_required: "الكاميرا والميكروفون مطلوبان",
    lets_go: "هيا بنا",
    end_session: "إنهاء الجلسة",
    mute: "كتم الصوت",
    unmute: "تفعيل الصوت",
    camera_on: "إيقاف الكاميرا",
    camera_off: "تشغيل الكاميرا",
    listening: "أسمعك…",
    suzzy_talking: "سوزي تتحدث…",
    thinking: "أفكر…",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    subscription: "الاشتراك",
    beauty_history: "سجل الجمال",
    help: "المساعدة",
    sign_out: "تسجيل الخروج",
    language: "اللغة",
    voice_chat: "محادثة صوتية",
    premium_feature: "ميزة مدفوعة",
    upgrade_to_unlock: "قومي بالترقية لفتح المحادثة الصوتية",
    save_changes: "حفظ التغييرات",
    saving: "جاري الحفظ…",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
  languageInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("suzzy-language");
    return (saved as Language) || "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("suzzy-language", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string>) => {
      let text = translations[language]?.[key] || translations.en[key] || key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    },
    [language]
  );

  const languageInfo = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageInfo }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
