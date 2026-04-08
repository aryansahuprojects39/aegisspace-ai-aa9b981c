import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import rocketImg from "@/assets/rocket.png";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-space-mid/20 to-background" />
      
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(hsla(185,100%,71%,0.3) 1px, transparent 1px), linear-gradient(90deg, hsla(185,100%,71%,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left — Text */}
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

          {/* Right — Floating Rocket Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center justify-center h-[350px] sm:h-[450px] lg:h-[550px] relative"
          >
            {/* Glow behind rocket */}
            <div className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
            <div className="absolute w-48 h-48 rounded-full bg-secondary/10 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
            
            {/* Floating rocket */}
            <motion.img
              src={rocketImg}
              alt="AegisSpace AI Rocket"
              width={800}
              height={1024}
              className="relative z-10 w-[280px] sm:w-[350px] lg:w-[420px] drop-shadow-[0_0_40px_hsla(185,100%,71%,0.3)]"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 1, -1, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Orbiting rings (CSS) */}
            <div className="absolute w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] rounded-full border border-primary/10 animate-spin" style={{ animationDuration: "20s" }} />
            <div className="absolute w-[350px] h-[350px] lg:w-[460px] lg:h-[460px] rounded-full border border-secondary/10 animate-spin" style={{ animationDuration: "30s", animationDirection: "reverse" }} />
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
