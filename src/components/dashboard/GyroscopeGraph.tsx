import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

const COLORS = { gyro_x: "#6EF3FF", gyro_y: "#FF6BD6", gyro_z: "#A66CFF" };

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-border/30 bg-card/90 backdrop-blur-md px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1">{new Date(d.created_at).toLocaleTimeString()}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value?.toFixed(2)}°/s
        </p>
      ))}
    </div>
  );
};

const GyroscopeGraph = ({ data, loading }: { data: TelemetryRow[]; loading: boolean }) => {
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const hasAnomaly = latest?.is_anomaly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border backdrop-blur-xl p-4 transition-shadow duration-300"
      style={{
        background: "hsl(var(--card) / 0.35)",
        borderColor: hasAnomaly ? "hsl(0, 80%, 55% / 0.5)" : "hsl(0 0% 100% / 0.05)",
        boxShadow: hasAnomaly
          ? "0 0 24px hsl(0, 80%, 55% / 0.25)"
          : "0 0 20px #A66CFF15, inset 0 1px 0 hsl(0 0% 100% / 0.03)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" style={{ color: "#A66CFF" }} />
          <span className="text-xs font-semibold text-foreground">Gyroscope</span>
        </div>
        {latest && (
          <div className="flex gap-2 text-[10px] font-mono">
            <span style={{ color: COLORS.gyro_x }}>X:{latest.gyro_x?.toFixed(1)}</span>
            <span style={{ color: COLORS.gyro_y }}>Y:{latest.gyro_y?.toFixed(1)}</span>
            <span style={{ color: COLORS.gyro_z }}>Z:{latest.gyro_z?.toFixed(1)}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </motion.div>
        ) : data.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="h-32 flex items-center justify-center border border-dashed border-border/30 rounded-xl">
            <span className="text-xs text-muted-foreground/50 animate-pulse">Waiting for ESP32 data…</span>
          </motion.div>
        ) : (
          <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 20% 30% / 0.2)" />
                <XAxis dataKey="created_at" hide />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="gyro_x" name="X" stroke={COLORS.gyro_x} strokeWidth={1.5} dot={false} animationDuration={500} />
                <Line type="monotone" dataKey="gyro_y" name="Y" stroke={COLORS.gyro_y} strokeWidth={1.5} dot={false} animationDuration={500} />
                <Line type="monotone" dataKey="gyro_z" name="Z" stroke={COLORS.gyro_z} strokeWidth={1.5} dot={false} animationDuration={500} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GyroscopeGraph;
