import { motion } from "framer-motion";
import featureTelemetry from "@/assets/feature-telemetry.jpg";
import featureAnomaly from "@/assets/feature-anomaly.jpg";
import featureAi from "@/assets/feature-ai.jpg";
import featureDashboard from "@/assets/feature-dashboard.jpg";
import insightLaunch from "@/assets/insight-launch.jpg";
import insightIot from "@/assets/insight-iot.jpg";

const features = [
  { title: "Real-Time Telemetry", description: "Live ESP32 sensor streaming", image: featureTelemetry },
  { title: "Anomaly Detection", description: "AI-powered threat identification", image: featureAnomaly },
  { title: "AI Predictions", description: "Predictive failure analysis", image: featureAi },
  { title: "Mission Control", description: "3D digital twin dashboard", image: featureDashboard },
  { title: "Launch Analytics", description: "Comprehensive mission data", image: insightLaunch },
  { title: "IoT Integration", description: "Hardware sensor connectivity", image: insightIot },
];

const FeatureCard = ({ feature, index, className = "" }: { feature: typeof features[0]; index: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`relative rounded-2xl overflow-hidden group cursor-pointer ${className}`}
  >
    <img
      src={feature.image}
      alt={feature.title}
      loading="lazy"
      width={640}
      height={512}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="text-base lg:text-lg font-semibold font-heading text-foreground">{feature.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
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
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Capabilities</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Everything You Need for <span className="gradient-text">Launch Monitoring</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            From raw ESP32 telemetry to AI-powered insights, all in real time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Tall left card */}
          <FeatureCard feature={features[0]} index={0} className="lg:row-span-2 min-h-[250px] lg:min-h-0" />
          {/* 2x2 grid */}
          <FeatureCard feature={features[1]} index={1} className="min-h-[200px]" />
          <FeatureCard feature={features[2]} index={2} className="min-h-[200px]" />
          <FeatureCard feature={features[3]} index={3} className="min-h-[200px]" />
          <FeatureCard feature={features[4]} index={4} className="min-h-[200px]" />
        </div>
        <div className="mt-4">
          <FeatureCard feature={features[5]} index={5} className="min-h-[200px] lg:min-h-[220px]" />
        </div>
      </div>
    </section>
  );
};

export default Features;
