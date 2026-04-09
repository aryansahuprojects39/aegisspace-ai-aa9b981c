import { motion } from "framer-motion";
import insightTelemetry from "@/assets/insight-telemetry.jpg";
import insightAnomaly from "@/assets/insight-anomaly.jpg";
import insightLaunch from "@/assets/insight-launch.jpg";
import insightIot from "@/assets/insight-iot.jpg";
import insightPredict from "@/assets/insight-predict.jpg";
import insightMission from "@/assets/insight-mission.jpg";

const insights = [
  { title: "Real-Time Telemetry in Modern Space Missions", image: insightTelemetry },
  { title: "AI-Powered Anomaly Detection for Satellites", image: insightAnomaly },
  { title: "The Future of Autonomous Launch Systems", image: insightLaunch },
  { title: "IoT Sensors Revolutionizing Space Hardware", image: insightIot },
  { title: "Predictive Analytics for Failure Prevention", image: insightPredict },
  { title: "Building Next-Gen Mission Control Centers", image: insightMission },
];

const InsightCard = ({ insight, index, className = "" }: { insight: typeof insights[0]; index: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`relative rounded-2xl overflow-hidden group cursor-pointer ${className}`}
  >
    <img
      src={insight.image}
      alt={insight.title}
      loading="lazy"
      width={640}
      height={512}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="text-sm lg:text-base font-semibold font-heading text-foreground leading-snug">{insight.title}</h3>
    </div>
  </motion.div>
);

const Insights = () => {
  return (
    <section id="insights" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Insights</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Latest from <span className="gradient-text">AegisSpace</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Stay updated with the latest developments in space monitoring and AI technology.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Large featured card */}
          <InsightCard insight={insights[0]} index={0} className="lg:row-span-2 min-h-[280px] lg:min-h-0" />
          {/* 4 smaller cards in 2x2 */}
          <InsightCard insight={insights[1]} index={1} className="min-h-[200px]" />
          <InsightCard insight={insights[2]} index={2} className="min-h-[200px]" />
          <InsightCard insight={insights[3]} index={3} className="min-h-[200px]" />
          <InsightCard insight={insights[4]} index={4} className="min-h-[200px]" />
        </div>
        {/* Bottom wide card */}
        <div className="mt-4">
          <InsightCard insight={insights[5]} index={5} className="min-h-[200px] lg:min-h-[220px]" />
        </div>
      </div>
    </section>
  );
};

export default Insights;
