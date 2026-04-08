import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wifi, Signal, Clock, AlertCircle, Activity, Thermometer,
  Zap, RotateCcw, LogOut, Settings, User, Radio
} from "lucide-react";
import ParallaxStars from "@/components/landing/ParallaxStars";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  temperature: { label: "Temp (°C)", color: "hsl(0, 80%, 60%)" },
  voltage: { label: "Voltage (V)", color: "hsl(185, 100%, 71%)" },
  current: { label: "Current (A)", color: "hsl(320, 100%, 71%)" },
  gyro_x: { label: "X", color: "hsl(185, 100%, 71%)" },
  gyro_y: { label: "Y", color: "hsl(320, 100%, 71%)" },
  gyro_z: { label: "Z", color: "hsl(260, 60%, 60%)" },
};

const TelemetryChart = ({ title, icon: Icon, dataKey, data, color }: {
  title: string; icon: React.ElementType; dataKey: string; data: any[]; color: string;
}) => (
  <div className="glass rounded-2xl p-4 card-tilt">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-xs font-semibold text-foreground">{title}</span>
      {data.length > 0 && (
        <span className="ml-auto text-xs font-mono text-primary">
          {data[data.length - 1]?.[dataKey]?.toFixed(1) ?? "—"}
        </span>
      )}
    </div>
    {data.length === 0 ? (
      <div className="h-24 flex items-center justify-center border border-dashed border-border rounded-xl">
        <span className="text-xs text-muted-foreground/50">Waiting for ESP32 data…</span>
      </div>
    ) : (
      <ChartContainer config={{ [dataKey]: { label: title, color } }} className="h-24 w-full">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsla(240,20%,30%,0.3)" />
          <XAxis dataKey="created_at" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    )}
  </div>
);

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: telemetry } = useTelemetry(50);

  const latest = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const hasAnomaly = latest?.is_anomaly;
  const statusColor = !latest ? "bg-muted" : hasAnomaly ? "bg-destructive" : "bg-primary";
  const statusLabel = !latest ? "Standby" : hasAnomaly ? "Anomaly" : "Nominal";

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TelemetryChart title="Temperature" icon={Thermometer} dataKey="temperature" data={telemetry} color="hsl(0, 80%, 60%)" />
          <TelemetryChart title="Voltage" icon={Zap} dataKey="voltage" data={telemetry} color="hsl(185, 100%, 71%)" />
          <TelemetryChart title="Current" icon={Activity} dataKey="current" data={telemetry} color="hsl(320, 100%, 71%)" />
          <div className="glass rounded-2xl p-4 card-tilt">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Gyroscope</span>
            </div>
            {telemetry.length === 0 ? (
              <div className="h-24 flex items-center justify-center border border-dashed border-border rounded-xl">
                <span className="text-xs text-muted-foreground/50">Waiting for ESP32 data…</span>
              </div>
            ) : (
              <ChartContainer config={{ gyro_x: chartConfig.gyro_x, gyro_y: chartConfig.gyro_y, gyro_z: chartConfig.gyro_z }} className="h-24 w-full">
                <LineChart data={telemetry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(240,20%,30%,0.3)" />
                  <XAxis dataKey="created_at" hide />
                  <YAxis hide domain={["auto", "auto"]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="gyro_x" stroke="hsl(185, 100%, 71%)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="gyro_y" stroke="hsl(320, 100%, 71%)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="gyro_z" stroke="hsl(260, 60%, 60%)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          {/* Digital Twin */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center card-tilt">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 animate-pulse" />
            </div>
            <span className="text-sm font-heading text-foreground">3D Digital Twin</span>
            <span className="text-xs text-muted-foreground mt-1">Waiting for ESP32 data…</span>
          </motion.div>

          {/* AI Analysis Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 card-tilt">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <span className="text-sm font-heading font-semibold text-foreground">AI Analysis</span>
            </div>
            <div className="space-y-4">
              {latest?.is_anomaly ? (
                <>
                  <div><div className="text-xs text-muted-foreground mb-1">Issue</div><div className="text-sm text-destructive">Anomaly Detected</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">Cause</div><div className="text-sm text-foreground">{latest.anomaly_reason || "Unknown"}</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">Confidence</div><div className="text-sm text-foreground">High</div></div>
                  <div><div className="text-xs text-muted-foreground mb-1">Suggestion</div><div className="text-sm text-foreground">Review telemetry data</div></div>
                </>
              ) : (
                [
                  { label: "Issue", value: latest ? "None" : "—" },
                  { label: "Cause", value: "—" },
                  { label: "Confidence", value: "—" },
                  { label: "Suggestion", value: latest ? "All nominal" : "—" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                    <div className="text-sm text-foreground/50">{item.value}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Data Stream */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 card-tilt">
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

          {/* Mini Radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6 flex flex-col items-center justify-center card-tilt">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border border-primary/20" />
              <div className="absolute inset-3 rounded-full border border-primary/15" />
              <div className="absolute inset-6 rounded-full border border-primary/10" />
              <Radio className="w-4 h-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs text-muted-foreground mt-3">Mini Radar</span>
          </motion.div>

          {/* Controls */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-6 card-tilt">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Quick Links</span>
            </div>
            <div className="space-y-3">
              <button onClick={() => navigate("/profile")}
                className="w-full text-left text-xs glass rounded-xl px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                Profile Settings
              </button>
              <button className="w-full text-left text-xs glass rounded-xl px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                Live Mode
              </button>
              <button className="w-full text-left text-xs glass rounded-xl px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                Simulate Failure
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
