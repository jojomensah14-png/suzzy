import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Sparkles, Star } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with Suzzy",
    icon: Sparkles,
    features: [
      "Basic chat with Suzzy",
      "General beauty tips",
      "Simple product suggestions",
      "Camera-assisted coaching",
    ],
    cta: "Current Plan",
    popular: false,
    gradient: "from-muted/40 to-muted/20",
    border: "border-border/20",
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "month",
    description: "Unlock your full beauty potential",
    icon: Star,
    features: [
      "Everything in Free",
      "Personalized skin analysis",
      "Advanced product recommendations",
      "Beauty history & progress tracking",
      "Priority response speed",
      "Exclusive looks & tutorials",
    ],
    cta: "Upgrade to Premium",
    popular: true,
    gradient: "from-primary/20 to-primary/5",
    border: "border-primary/30",
  },
  {
    name: "VIP",
    price: "$24.99",
    period: "month",
    description: "The ultimate beauty experience",
    icon: Crown,
    features: [
      "Everything in Premium",
      "AI skin scanning & diagnostics",
      "Custom routine builder",
      "Exclusive brand partnerships",
      "1-on-1 beauty consultations",
      "Early access to new features",
      "VIP-only beauty community",
    ],
    cta: "Go VIP",
    popular: false,
    gradient: "from-gold-soft/15 to-gold-soft/5",
    border: "border-gold-soft/30",
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app px-6 py-8 relative overflow-hidden">
      {/* Ambient */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-100 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(350 40% 55% / 0.05) 0%, transparent 70%)" }}
      />

      {/* Header */}
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full surface-glass flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={15} />
        </button>

        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-gradient-rose mb-3">
            Choose Your Glow
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Upgrade your beauty journey with Suzzy. More features, deeper insights, exclusive access.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border ${tier.border} bg-gradient-to-b ${tier.gradient} p-6 flex flex-col ${
                tier.popular ? "ring-1 ring-primary/20 scale-[1.02]" : ""
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] text-primary font-medium tracking-wide uppercase">
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <tier.icon size={20} className="text-primary/60 mb-3" />
                <h3 className="font-display text-xl text-foreground mb-1">{tier.name}</h3>
                <p className="text-xs text-muted-foreground">{tier.description}</p>
              </div>

              <div className="mb-5">
                <span className="font-display text-3xl text-foreground">{tier.price}</span>
                <span className="text-xs text-muted-foreground/60 ml-1">/{tier.period}</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs text-foreground/70">
                    <Check size={13} className="text-primary/60 mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tier.popular
                    ? "btn-rose"
                    : tier.name === "VIP"
                    ? "surface-glass border border-gold-soft/20 text-gold-soft hover:border-gold-soft/40"
                    : "surface-glass border border-border/20 text-foreground/60 hover:text-foreground"
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
