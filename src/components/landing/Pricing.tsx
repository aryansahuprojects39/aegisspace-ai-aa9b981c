import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    desc: "Basic monitoring for small projects",
    features: [
      "1 ESP32 Device",
      "Real-time telemetry",
      "Basic anomaly alerts",
      "7-day data retention",
      "Email support",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    desc: "AI-powered detection for serious missions",
    features: [
      "Up to 10 ESP32 Devices",
      "AI anomaly detection",
      "Predictive failure analysis",
      "30-day data retention",
      "Priority support",
      "Custom thresholds",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "Full system with API & custom integrations",
    features: [
      "Unlimited devices",
      "Full AI suite",
      "Custom API access",
      "Unlimited retention",
      "24/7 dedicated support",
      "SLA guarantee",
      "White-label option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-purple/5 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Pricing</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Choose Your <span className="gradient-text">Mission Plan</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Scale from prototype to production with transparent pricing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`rounded-2xl p-6 lg:p-8 card-tilt ${
                plan.highlighted
                  ? "glass-strong glow-cyan relative"
                  : "glass"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-cyan-pink text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold font-heading text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold font-heading text-foreground">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground text-sm">/mo</span>}
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
