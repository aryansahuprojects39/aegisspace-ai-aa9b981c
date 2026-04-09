import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldAlert, Brain, Monitor } from "lucide-react";
import featureTelemetry from "@/assets/feature-telemetry.jpg";
import featureAnomaly from "@/assets/feature-anomaly.jpg";
import featureAi from "@/assets/feature-ai.jpg";
import featureDashboard from "@/assets/feature-dashboard.jpg";

const features = [
  {
    icon: Activity,
    title: "Real-Time Telemetry",
    description: "Live streaming of temperature, voltage, current, and gyroscope data directly from ESP32 hardware.",
    gradient: "from-primary/20 to-primary/5",
    image: featureTelemetry,
  },
  {
    icon: ShieldAlert,
    title: "Anomaly Detection",
    description: "Intelligent threshold monitoring with multi-sensor correlation to detect anomalies before failures occur.",
    gradient: "from-secondary/20 to-secondary/5",
    image: featureAnomaly,
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Machine learning models analyze patterns across telemetry streams to predict potential system failures.",
    gradient: "from-accent/30 to-accent/10",
    image: featureAi,
  },
  {
    icon: Monitor,
    title: "Mission Control Dashboard",
    description: "Real-time 3D digital twin, status orbs, and comprehensive monitoring panels in one unified view.",
    gradient: "from-primary/20 to-secondary/10",
    image: featureDashboard,
  },
];

const FlipCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="perspective-1000 h-[280px] cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front */}
        <div className="absolute inset-0 glass rounded-2xl p-6 flex flex-col" style={{ backfaceVisibility: "hidden" }}>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
            <feature.icon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold font-heading text-foreground mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
          <span className="text-[10px] text-primary mt-2">Click to flip →</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 glass rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <img
            src={feature.image}
            alt={feature.title}
            loading="lazy"
            width={512}
            height={512}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-sm font-semibold font-heading text-foreground">{feature.title}</h3>
            <span className="text-[10px] text-primary">Click to flip back</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

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
            <FlipCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
