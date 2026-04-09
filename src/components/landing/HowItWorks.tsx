import { motion } from "framer-motion";
import { Cpu, Webhook, Database, Brain, Monitor } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import stepEsp32 from "@/assets/step-esp32.jpg";
import stepWebhook from "@/assets/step-webhook.jpg";
import stepDatabase from "@/assets/step-database.jpg";
import stepAi from "@/assets/step-ai.jpg";
import stepMonitor from "@/assets/step-monitor.jpg";

const steps = [
  { icon: Cpu, label: "FLARE", desc: "Sensors collect telemetry", image: stepEsp32 },
  { icon: Webhook, label: "n8n", desc: "Webhook processes data", image: stepWebhook },
  { icon: Database, label: "Cloud DB", desc: "Store & validate", image: stepDatabase },
  { icon: Brain, label: "AI Engine", desc: "Detect anomalies", image: stepAi },
  { icon: Monitor, label: "Dashboard", desc: "Real-time insights", image: stepMonitor },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-purple/5 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Pipeline</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            How <span className="gradient-text">It Works</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            From hardware sensors to actionable intelligence in milliseconds.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center"
            >
              <HoverCard openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div className="glass rounded-2xl p-6 text-center min-w-[140px] card-tilt cursor-pointer">
                    <div className="w-14 h-14 rounded-xl gradient-cyan-pink mx-auto flex items-center justify-center mb-3">
                      <step.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div className="font-heading font-semibold text-foreground">{step.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{step.desc}</div>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-0 overflow-hidden glass border-border" side="top" sideOffset={8}>
                  <img
                    src={step.image}
                    alt={step.label}
                    loading="eager"
                    width={256}
                    height={160}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-3">
                    <div className="text-sm font-semibold text-foreground">{step.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{step.desc}</div>
                  </div>
                </HoverCardContent>
              </HoverCard>

              {i < steps.length - 1 && (
                <div className="hidden lg:flex items-center px-2">
                  <div className="w-12 h-[2px] bg-gradient-to-r from-primary/60 to-secondary/60 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-secondary/60" />
                  </div>
                </div>
              )}
              {i < steps.length - 1 && (
                <div className="lg:hidden w-[2px] h-8 bg-gradient-to-b from-primary/60 to-secondary/60" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
