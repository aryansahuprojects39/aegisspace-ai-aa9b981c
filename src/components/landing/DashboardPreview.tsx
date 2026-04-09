import { motion } from "framer-motion";
import { Wifi, Signal, Clock, AlertCircle } from "lucide-react";

const DashboardPreview = () => {
  return (
    <section id="dashboard" className="relative py-24 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Preview</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-heading mt-3">
            Mission Control <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            A real-time command center — no simulated data, only live telemetry.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass rounded-3xl p-4 lg:p-6 glow-cyan max-w-5xl mx-auto"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between glass rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wifi className="w-4 h-4 text-primary" />
                <span>FLARE Status</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Signal className="w-4 h-4 text-primary" />
                <span>Signal</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                <span>Latency</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted animate-pulse" />
              <span className="text-xs text-muted-foreground">Waiting for FLARE data…</span>
            </div>
          </div>

          {/* Grid mock */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Telemetry panels */}
            {["Temperature", "Voltage", "Current", "Gyroscope"].map((label) => (
              <div key={label} className="glass rounded-xl p-4 col-span-1">
                <div className="text-xs text-muted-foreground mb-2">{label}</div>
                <div className="h-16 flex items-center justify-center text-xs text-muted-foreground/50 border border-dashed border-border rounded-lg">
                  Awaiting data…
                </div>
              </div>
            ))}

            {/* Center: digital twin placeholder */}
            <div className="glass rounded-xl p-4 col-span-3 lg:col-span-2 lg:row-span-2 flex flex-col items-center justify-center min-h-[180px]">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 animate-pulse" />
              </div>
              <span className="text-xs text-muted-foreground">3D Digital Twin</span>
              <span className="text-[10px] text-muted-foreground/50 mt-1">Waiting for FLARE data…</span>
            </div>

            {/* AI panel */}
            <div className="glass rounded-xl p-4 col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">AI Analysis</span>
              </div>
              <div className="space-y-2">
                {["Issue", "Cause", "Confidence", "Suggestion"].map((field) => (
                  <div key={field} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{field}</span>
                    <span className="text-muted-foreground/50">—</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPreview;
