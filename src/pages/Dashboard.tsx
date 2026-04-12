import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wifi, Signal, Clock, Activity,
  LogOut, User, Radio, Rocket, Download
} from "lucide-react";
import ParallaxStars from "@/components/landing/ParallaxStars";
import { useTelemetry } from "@/hooks/useTelemetry";
import RocketDigitalTwin from "@/components/dashboard/RocketDigitalTwin";
import TelemetryGridSection from "@/components/dashboard/TelemetryGridSection";
import AIAnalysisPanel from "@/components/dashboard/AIAnalysisPanel";
import DeviceConnectivity from "@/components/dashboard/DeviceConnectivity";
import { useAnomalyNotifications } from "@/hooks/useAnomalyNotifications";
import { useCallback } from "react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: telemetry, loading: telemetryLoading } = useTelemetry(50);
  useAnomalyNotifications();
  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const hasAnomaly = latest?.is_anomaly;
  const statusColor = !latest ? "bg-muted" : hasAnomaly ? "bg-destructive" : "bg-primary";
  const statusLabel = !latest ? "Standby" : hasAnomaly ? "Anomaly" : "Nominal";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleExportCSV = useCallback(() => {
    if (telemetry.length === 0) return;
    const headers = ["timestamp", "temperature", "voltage", "current", "gyro_x", "gyro_y", "gyro_z", "is_anomaly", "anomaly_reason"];
    const rows = telemetry.map((r) =>
      [
        r.created_at,
        r.temperature ?? "",
        r.voltage ?? "",
        r.current ?? "",
        r.gyro_x ?? "",
        r.gyro_y ?? "",
        r.gyro_z ?? "",
        r.is_anomaly,
        r.anomaly_reason ?? "",
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aegis-telemetry-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [telemetry]);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <ParallaxStars />

      {/* Top Bar */}
      <header className="relative z-10 glass-strong border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="gradient-text italic tracking-wider">Aegis</span>
              <span className="text-foreground">Space</span>
              <span className="text-primary text-[10px] font-mono ml-1 bg-primary/10 px-1.5 py-0.5 rounded">AI</span>
            </span>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Wifi className="w-3.5 h-3.5 text-primary" />
                <span>FLARE</span>
                <span className={`w-2 h-2 rounded-full ${telemetry.length > 0 ? "bg-primary" : "bg-muted"} animate-pulse`} />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Signal className="w-3.5 h-3.5 text-primary" />
                <span>Signal: {telemetry.length > 0 ? "OK" : "—"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Points: {telemetry.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={telemetry.length === 0}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Export telemetry as CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${statusColor} animate-pulse`} />
              <span className="text-xs text-muted-foreground hidden sm:inline">{statusLabel}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <button onClick={() => navigate("/profile")} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <User className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">{user?.email}</span>
            </button>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 p-4 lg:p-6">
        {/* Telemetry Graphs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <TelemetryGridSection data={telemetry} loading={telemetryLoading} />
        </motion.div>

        {/* Digital Twin + AI Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass rounded-2xl p-4 min-h-[320px] card-tilt">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">3D Digital Twin — Launch Vehicle</span>
              <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${hasAnomaly ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>
                {statusLabel}
              </span>
            </div>
            <RocketDigitalTwin
              gyroX={latest?.gyro_x || 0}
              gyroY={latest?.gyro_y || 0}
              gyroZ={latest?.gyro_z || 0}
              isAnomaly={!!hasAnomaly}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AIAnalysisPanel telemetry={telemetry} />
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Data Stream */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-4 card-tilt">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Data Stream</span>
            </div>
            <div className="h-32 overflow-y-auto space-y-1 scrollbar-thin">
              {telemetry.length === 0 ? (
                <div className="h-full flex items-center justify-center border border-dashed border-border rounded-xl">
                  <span className="text-xs text-muted-foreground/50">No data stream active</span>
                </div>
              ) : (
                telemetry.slice(-10).reverse().map((row) => (
                  <div key={row.id} className="text-[10px] font-mono text-muted-foreground truncate">
                    {new Date(row.created_at).toLocaleTimeString()} | T:{row.temperature?.toFixed(1)} V:{row.voltage?.toFixed(1)} A:{row.current?.toFixed(1)}
                    {row.is_anomaly && <span className="text-destructive ml-1">⚠</span>}
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Device Connectivity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <DeviceConnectivity isConnected={telemetry.length > 0} dataPoints={telemetry.length} />
          </motion.div>

          {/* Mini Radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center card-tilt">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border border-primary/20" />
              <div className="absolute inset-3 rounded-full border border-primary/15" />
              <div className="absolute inset-6 rounded-full border border-primary/10" />
              <Radio className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              {telemetry.length > 0 && (
                <div className="absolute inset-0 rounded-full border-t-2 border-primary/40 animate-spin" style={{ animationDuration: "3s" }} />
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-3">Tracking Radar</span>
            <span className="text-[10px] text-primary mt-1">
              {telemetry.length > 0 ? "Active" : "Standby"}
            </span>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
