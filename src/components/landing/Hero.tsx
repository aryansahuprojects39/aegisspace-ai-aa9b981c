import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import pslvHero from "@/assets/pslv-hero.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={pslvHero}
          alt="PSLV Launch Vehicle"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24">
        <div className="max-w-2xl space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 lg:space-y-8"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Real-Time Satellite Monitoring
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading leading-[1.1] tracking-tight">
              <span className="gradient-text">AegisSpace</span>
              <br />
              <span className="text-foreground">AI</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-md leading-relaxed">
              Mission-critical launch monitoring powered by real ESP32 telemetry, AI anomaly detection, and predictive failure analysis.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="/signup" className="btn-pill gradient-cyan-pink text-primary-foreground text-sm flex items-center gap-2 group no-underline">
                Start Monitoring
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="btn-pill glass text-foreground text-sm flex items-center gap-2 hover:bg-muted/40">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-6 pt-2">
              {[
                { value: "99.9%", label: "Uptime" },
                { value: "<50ms", label: "Latency" },
                { value: "24/7", label: "Monitoring" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg font-bold text-primary font-heading">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
