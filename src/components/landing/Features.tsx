import { motion } from "framer-motion";
import { Activity, ShieldAlert, Brain, Monitor } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time Telemetry",
    description: "Live streaming of temperature, voltage, current, and gyroscope data directly from ESP32 hardware.",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: ShieldAlert,
    title: "Anomaly Detection",
    description: "Intelligent threshold monitoring with multi-sensor correlation to detect anomalies before failures occur.",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Machine learning models analyze patterns across telemetry streams to predict potential system failures.",
    gradient: "from-accent/30 to-accent/10",
  },
  {
    icon: Monitor,
    title: "Mission Control Dashboard",
    description: "Real-time 3D digital twin, status orbs, and comprehensive monitoring panels in one unified view.",
    gradient: "from-primary/20 to-secondary/10",
  },
];

const Features = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Capabilities</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Everything You Need for <span className="gradient-text">Launch Monitoring</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            From raw ESP32 telemetry to AI-powered insights, all in real time.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 card-tilt group cursor-default"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
