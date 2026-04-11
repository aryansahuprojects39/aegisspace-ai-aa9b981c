import { useMemo, useState, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

interface ThresholdZone {
  low: number;
  high: number;
  warningLow: number;
  warningHigh: number;
  criticalLow: number;
  criticalHigh: number;
}

interface Props {
  title: string;
  icon: React.ElementType;
  dataKey: string;
  color: string;
  unit: string;
  normalRange?: string;
  data: TelemetryRow[];
  loading: boolean;
  thresholds?: ThresholdZone;
}

const TIME_RANGES = [
  { label: "10s", points: 10 },
  { label: "30s", points: 30 },
  { label: "All", points: 50 },
] as const;

function getStatus(value: number | null, thresholds?: ThresholdZone): "Normal" | "Warning" | "Critical" {
  if (!value || !thresholds) return "Normal";
  if (value < thresholds.criticalLow || value > thresholds.criticalHigh) return "Critical";
  if (value < thresholds.warningLow || value > thresholds.warningHigh) return "Warning";
  return "Normal";
}

const CustomTooltip = ({ active, payload, unit, normalRange, thresholds }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const val = payload[0].value;
  const status = getStatus(val, thresholds);
  const statusColors = { Normal: "text-primary", Warning: "text-yellow-400", Critical: "text-destructive" };
  return (
    <div className="rounded-xl border border-border/30 bg-card/90 backdrop-blur-md px-3 py-2 text-xs shadow-lg min-w-[140px]">
      <p className="text-foreground font-semibold">{val?.toFixed(2)} {unit}</p>
      <p className="text-muted-foreground">{new Date(d.created_at).toLocaleTimeString()}</p>
      <p className={`font-medium ${statusColors[status]}`}>{status}</p>
      {normalRange && <p className="text-muted-foreground/60 mt-0.5">Range: {normalRange}</p>}
      {d.is_anomaly && <p className="text-destructive font-semibold mt-1">⚠ Anomaly Detected</p>}
    </div>
  );
};

const AnomalyDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload?.is_anomaly) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="none" stroke="hsl(0, 80%, 55%)" strokeWidth={1.5} opacity={0.4}>
        <animate attributeName="r" values="5;10;5" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={3.5} fill="hsl(0, 80%, 55%)" opacity={0.9} />
    </g>
  );
};

const TelemetryGraph = ({ title, icon: Icon, dataKey, color, unit, normalRange, data, loading, thresholds }: Props) => {
  const [range, setRange] = useState<number>(50);

  const visibleData = useMemo(() => data.slice(-range), [data, range]);
  const latestValue = visibleData.length > 0 ? (visibleData[visibleData.length - 1] as any)?.[dataKey] : null;
  const prevValue = visibleData.length > 1 ? (visibleData[visibleData.length - 2] as any)?.[dataKey] : null;
  const hasAnomaly = visibleData.length > 0 && visibleData[visibleData.length - 1]?.is_anomaly;
  const gradientId = `grad-${dataKey}`;

  const changePercent = useMemo(() => {
    if (latestValue == null || prevValue == null || prevValue === 0) return null;
    return ((latestValue - prevValue) / Math.abs(prevValue)) * 100;
  }, [latestValue, prevValue]);

  const trendData = useMemo(() => {
    if (visibleData.length < 3) return null;
    const last3 = visibleData.slice(-3).map((d: any) => d[dataKey] as number).filter(Boolean);
    if (last3.length < 2) return null;
    const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
    const slope = (last3[last3.length - 1] - last3[0]) / last3.length;
    return { value: avg + slope * 2 };
  }, [visibleData, dataKey]);

  const anomalyTimestamps = useMemo(
    () => visibleData.filter((d) => d.is_anomaly).map((d) => d.created_at),
    [visibleData]
  );

  const status = getStatus(latestValue, thresholds);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl border backdrop-blur-xl p-4 transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: "hsl(var(--card) / 0.35)",
        borderColor: hasAnomaly ? "hsl(0, 80%, 55% / 0.5)" : "hsl(0 0% 100% / 0.05)",
        boxShadow: hasAnomaly
          ? `0 0 24px hsl(0, 80%, 55% / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.03)`
          : `0 4px 24px ${color}10, inset 0 1px 0 hsl(0 0% 100% / 0.03)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-semibold text-foreground">{title}</span>
        </div>
        {latestValue != null && (
          <div className="flex items-center gap-1.5">
            {changePercent != null && (
              <span className={`flex items-center gap-0.5 text-[10px] font-mono ${changePercent > 0 ? "text-green-400" : changePercent < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                {changePercent > 0 ? <TrendingUp className="w-3 h-3" /> : changePercent < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {Math.abs(changePercent).toFixed(1)}%
              </span>
            )}
            <span className="text-sm font-mono font-bold" style={{ color }}>
              {latestValue.toFixed(1)}
              <span className="text-[10px] text-muted-foreground ml-0.5">{unit}</span>
            </span>
          </div>
        )}
      </div>

      {/* Time range selector */}
      <div className="flex gap-1 mb-2">
        {TIME_RANGES.map((r) => (
          <button
            key={r.label}
            onClick={() => setRange(r.points)}
            className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${range === r.points ? "bg-primary/20 text-primary" : "text-muted-foreground/50 hover:text-muted-foreground"}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" exit={{ opacity: 0 }} className="space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </motion.div>
        ) : visibleData.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="h-36 flex items-center justify-center border border-dashed border-border/30 rounded-xl">
            <span className="text-xs text-muted-foreground/50 animate-pulse">Waiting for ESP32 data…</span>
          </motion.div>
        ) : (
          <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 20% 30% / 0.15)" />
                <XAxis dataKey="created_at" hide />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={35} />
                <Tooltip content={<CustomTooltip unit={unit} normalRange={normalRange} thresholds={thresholds} />} />

                {/* Threshold zones */}
                {thresholds && (
                  <>
                    <ReferenceArea y1={thresholds.warningLow} y2={thresholds.warningHigh} fill="#FFD93D" fillOpacity={0.03} />
                    <ReferenceArea y1={thresholds.criticalHigh} y2={thresholds.criticalHigh + 50} fill="#FF4444" fillOpacity={0.04} />
                    <ReferenceArea y1={thresholds.criticalLow - 50} y2={thresholds.criticalLow} fill="#FF4444" fillOpacity={0.04} />
                  </>
                )}

                {/* Anomaly vertical lines */}
                {anomalyTimestamps.map((ts) => (
                  <ReferenceLine key={ts} x={ts} stroke="hsl(0, 80%, 55%)" strokeDasharray="4 4" strokeOpacity={0.5} />
                ))}

                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={<AnomalyDot />}
                  activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "hsl(var(--background))" }}
                  animationDuration={400}
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
