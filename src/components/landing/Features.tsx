import { motion } from "framer-motion";
import { Satellite, ShieldAlert, Brain, Monitor, BarChart3, Cpu } from "lucide-react";
import featureTelemetry from "@/assets/feature-telemetry.jpg";
import featureAnomaly from "@/assets/feature-anomaly.jpg";
import featureAi from "@/assets/feature-ai.jpg";
import featureDashboard from "@/assets/feature-dashboard.jpg";
import insightLaunch from "@/assets/insight-launch.jpg";
import insightIot from "@/assets/insight-iot.jpg";

const features = [
  {
    title: "Real-Time Telemetry",
    shortDesc: "Live ESP32 sensor streaming",
    longDesc: "Stream live data from ESP32 sensors with sub-second latency. Monitor temperature, voltage, current, and gyroscope readings in real time.",
    icon: Satellite,
    image: featureTelemetry,
  },
  {
    title: "Anomaly Detection",
    shortDesc: "AI-powered threat identification",
    longDesc: "Advanced machine learning algorithms continuously analyze sensor data to detect anomalies before they become critical failures.",
    icon: ShieldAlert,
    image: featureAnomaly,
  },
  {
    title: "AI Predictions",
    shortDesc: "Predictive failure analysis",
    longDesc: "Leverage deep learning models trained on historical mission data to predict potential system failures hours before they occur.",
    icon: Brain,
    image: featureAi,
  },
  {
    title: "Mission Control",
    shortDesc: "3D digital twin dashboard",
    longDesc: "Visualize your launch vehicle as an interactive 3D digital twin with real-time sensor overlays and mission timeline tracking.",
    icon: Monitor,
    image: featureDashboard,
  },
  {
    title: "Launch Analytics",
    shortDesc: "Comprehensive mission data",
    longDesc: "Post-mission analytics with detailed performance reports, trajectory analysis, and sensor correlation dashboards.",
    icon: BarChart3,
    image: insightLaunch,
  },
  {
    title: "IoT Integration",
    shortDesc: "Hardware sensor connectivity",
    longDesc: "Seamlessly connect ESP32, Arduino, and custom sensor arrays via MQTT and REST APIs for plug-and-play telemetry ingestion.",
    icon: Cpu,
    image: insightIot,
  },
];

const FlipCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group perspective-1000 h-[320px]"
  >
    <div className="flip-card-inner relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
      {/* Front */}
      <div className="absolute inset-0 [backface-visibility:hidden] glass rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 border border-border/30">
        <div className="w-14 h-14 rounded-xl gradient-cyan-pink flex items-center justify-center">
          <feature.icon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-bold font-heading text-foreground">{feature.title}</h3>
        <p className="text-sm text-muted-foreground">{feature.shortDesc}</p>
        <span className="text-xs text-primary mt-2 opacity-60">Hover to explore →</span>
      </div>
      {/* Back */}
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl overflow-hidden">
        <img
          src={feature.image}
          alt={feature.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-base font-bold font-heading text-foreground mb-2">{feature.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{feature.longDesc}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

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
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Features</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Everything You Need for <span className="gradient-text">Launch Monitoring</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            From raw ESP32 telemetry to AI-powered insights, all in real time.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FlipCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
