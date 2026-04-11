import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    monthly: 19,
    discountedMonthly: 15,
    yearly: 189,
    yearlyOriginal: 228,
    desc: "Basic monitoring for small projects",
    features: [
      "1 FLARE Module",
      "Real-time telemetry",
      "Basic anomaly alerts",
      "7-day data retention",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
    hasTrial: true,
  },
  {
    name: "Pro",
    monthly: 79,
    discountedMonthly: 63,
    yearly: 749,
    yearlyOriginal: 948,
    desc: "AI-powered detection for serious missions",
    features: [
      "Up to 10 FLARE Modules",
      "AI anomaly detection",
      "Predictive failure analysis",
      "30-day data retention",
      "Priority support",
      "Custom thresholds",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    hasTrial: true,
  },
  {
    name: "Enterprise",
    monthly: null,
    discountedMonthly: null,
    yearly: null,
    yearlyOriginal: null,
    desc: "Full system with API & custom integrations",
    features: [
      "Unlimited FLARE Modules",
      "Full AI suite",
      "Custom API access",
      "Unlimited retention",
      "24/7 dedicated support",
      "SLA guarantee",
      "White-label option",
    ],
    cta: "Contact Sales",
    highlighted: false,
    hasTrial: false,
  },
];

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-purple/5 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Pricing</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Choose Your <span className="gradient-text">Mission Plan</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Scale from prototype to production with transparent pricing.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span className={`text-sm ${!isYearly ? "text-foreground font-semibold" : "text-muted-foreground"}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-primary-foreground transition-transform ${isYearly ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm ${isYearly ? "text-foreground font-semibold" : "text-muted-foreground"}`}>Yearly</span>
          {isYearly && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Save 20%</span>
          )}
        </motion.div>

        {/* First-time discount banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center mb-10"
        >
          <div className="glass rounded-full px-5 py-2 flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">🎉 <strong className="text-foreground">20% off</strong> your first month — auto-applied at checkout</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const isCustom = plan.monthly === null;
            const displayPrice = isYearly
              ? plan.yearly
              : plan.discountedMonthly;
            const originalPrice = isYearly
              ? plan.yearlyOriginal
              : plan.monthly;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`rounded-2xl p-6 lg:p-8 card-tilt ${
                  plan.highlighted ? "glass-strong glow-cyan relative" : "glass"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-cyan-pink text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-heading text-foreground">{plan.name}</h3>
                    {plan.hasTrial && (
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">7-Day Free Trial</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  {isCustom ? (
                    <span className="text-4xl font-bold font-heading text-foreground">Custom</span>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold font-heading text-foreground">
                          ${isYearly ? displayPrice : displayPrice}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
                        <span className="text-muted-foreground text-sm">/{isYearly ? "yr" : "mo"}</span>
                      </div>
                      <p className="text-[10px] text-primary mt-1">
                        {isYearly
                          ? `Save 20% — was $${originalPrice}/yr`
                          : `First month only, then $${plan.monthly}/mo`}
                      </p>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`btn-pill w-full text-sm ${
                    plan.highlighted
                      ? "gradient-cyan-pink text-primary-foreground"
                      : "glass text-foreground hover:bg-muted/40"
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
