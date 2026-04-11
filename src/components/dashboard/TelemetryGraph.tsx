import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

interface Props {
  title: string;
  icon: React.ElementType;
  dataKey: string;
  color: string;
  unit: string;
  normalRange?: string;
  data: TelemetryRow[];
  loading: boolean;
}

const CustomTooltip = ({ active, payload, unit, normalRange }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border/30 bg-card/90 backdrop-blur-md px-3 py-2 text-xs shadow-lg">
      <p className="text-foreground font-semibold">{payload[0].value?.toFixed(2)} {unit}</p>
      <p className="text-muted-foreground">{new Date(d.created_at).toLocaleTimeString()}</p>
      {normalRange && <p className="text-muted-foreground/60 mt-0.5">Normal: {normalRange}</p>}
    </div>
  );
};

const AnomalyDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload?.is_anomaly) return null;
  return (
    <circle cx={cx} cy={cy} r={5} fill="hsl(0, 80%, 55%)" stroke="hsl(0, 80%, 55%)" strokeWidth={2} opacity={0.9}>
      <animate attributeName="r" values="4;7;4" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.5s" repeatCount="indefinite" />
    </circle>
  );
};

const TelemetryGraph = ({ title, icon: Icon, dataKey, color, unit, normalRange, data, loading }: Props) => {
  const latestValue = data.length > 0 ? (data[data.length - 1] as any)?.[dataKey] : null;
  const hasAnomaly = data.length > 0 && data[data.length - 1]?.is_anomaly;
  const gradientId = `grad-${dataKey}`;

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
          ? `0 0 24px hsl(0, 80%, 55% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.03)`
          : `0 0 20px ${color}15, inset 0 1px 0 hsl(0 0% 100% / 0.03)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-semibold text-foreground">{title}</span>
        </div>
        {latestValue !== null && latestValue !== undefined && (
          <span className="text-sm font-mono font-bold" style={{ color }}>
            {latestValue.toFixed(1)} <span className="text-[10px] text-muted-foreground">{unit}</span>
          </span>
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
              <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 20% 30% / 0.2)" />
                <XAxis dataKey="created_at" hide />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip content={<CustomTooltip unit={unit} normalRange={normalRange} />} />
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={<AnomalyDot />}
                  activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "hsl(var(--background))" }}
                  animationDuration={500}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TelemetryGraph;
