import { motion } from "framer-motion";
import about1 from "@/assets/about-1.jpg";
import about2 from "@/assets/about-2.jpg";

const AboutUs = () => {
  return (
    <section id="about" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — overlapping images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative h-[400px] lg:h-[500px]"
          >
            <div className="absolute top-0 left-0 w-[65%] h-[75%] rounded-2xl overflow-hidden glass">
              <img src={about1} alt="Mission control center" loading="lazy" width={640} height={800} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-[55%] h-[60%] rounded-2xl overflow-hidden glass border-4 border-background">
              <img src={about2} alt="Satellite orbiting Earth" loading="lazy" width={640} height={640} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          {/* Right — text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">About Us</span>
            <h2 className="text-3xl lg:text-4xl font-bold font-heading leading-tight">
              Innovating the Future of{" "}
              <span className="gradient-text">Launch Monitoring</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              AegisSpace AI combines real-time ESP32 hardware telemetry with advanced artificial intelligence to provide mission-critical monitoring for satellite launches. Our platform detects anomalies before they become failures, ensuring every mission stays on track.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From predictive failure analysis to a stunning 3D digital twin dashboard, we deliver the tools space teams need to make confident, data-driven decisions in real time.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "500+", label: "Missions Tracked" },
                { value: "99.9%", label: "Detection Rate" },
                { value: "24/7", label: "Live Monitoring" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-xl p-4 text-center">
                  <div className="text-xl font-bold text-primary font-heading">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
