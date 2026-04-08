import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wifi, Signal, Clock, AlertCircle, Activity, Thermometer,
  Zap, RotateCcw, LogOut, Settings, User, Radio
} from "lucide-react";
import ParallaxStars from "@/components/landing/ParallaxStars";

const TelemetryCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children?: React.ReactNode }) => (
  <div className="glass rounded-2xl p-4 card-tilt">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs font-semibold text-foreground">{title}</span>
    </div>
    {children || (
      <div className="h-24 flex items-center justify-center border border-dashed border-border rounded-xl">
        <span className="text-xs text-muted-foreground/50">Waiting for ESP32 data…</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <ParallaxStars />

      {/* Top Bar */}
      <header className="relative z-10 glass-strong border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-heading font-bold text-foreground text-sm">
              Aegis<span className="gradient-text">Space</span> AI
            </span>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wifi className="w-3.5 h-3.5 text-primary" />
                <span>ESP32</span>
                <span className="w-2 h-2 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Signal className="w-3.5 h-3.5 text-primary" />
                <span>Signal: —</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Latency: —</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mission Status Orb */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-muted border border-border animate-pulse" />
              <span className="text-xs text-muted-foreground hidden sm:inline">Standby</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            </div>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Telemetry Cards */}
          <TelemetryCard title="Temperature" icon={Thermometer} />
          <TelemetryCard title="Voltage" icon={Zap} />
          <TelemetryCard title="Current" icon={Activity} />
          <TelemetryCard title="Gyroscope" icon={RotateCcw} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Digital Twin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center card-tilt"
          >
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse" />
            </div>
            <span className="text-sm font-heading text-foreground">3D Digital Twin</span>
            <span className="text-xs text-muted-foreground mt-1">Waiting for ESP32 data…</span>
          </motion.div>

          {/* AI Analysis Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 card-tilt"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-heading font-semibold text-foreground">AI Analysis</span>
            </div>
            <div className="space-y-4">
              {[
                { label: "Issue", value: "—" },
                { label: "Cause", value: "—" },
                { label: "Confidence", value: "—" },
                { label: "Suggestion", value: "—" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                  <div className="text-sm text-foreground/50">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Data Stream */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 card-tilt"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Data Stream</span>
            </div>
            <div className="h-20 flex items-center justify-center border border-dashed border-border rounded-xl">
              <span className="text-xs text-muted-foreground/50">No data stream active</span>
            </div>
          </motion.div>

          {/* Mini Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center card-tilt"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border border-primary/20" />
              <div className="absolute inset-3 rounded-full border border-primary/15" />
              <div className="absolute inset-6 rounded-full border border-primary/10" />
              <Radio className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs text-muted-foreground mt-3">Mini Radar</span>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-6 card-tilt"
          >
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Controls</span>
            </div>
            <div className="space-y-3">
              {["Live Mode", "Focus Mode", "Simulate Failure"].map((ctrl) => (
                <button
                  key={ctrl}
                  className="w-full text-left text-xs glass rounded-xl px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  {ctrl}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
