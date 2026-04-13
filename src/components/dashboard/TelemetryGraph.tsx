import { useMemo, useState } from "react";
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;
type NumericTelemetryKey = "temperature" | "voltage" | "current" | "gyro_x" | "gyro_y" | "gyro_z";

interface TooltipPayloadItem {
  payload: TelemetryRow & { _projected?: boolean };
  value: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  unit: string;
  normalRange?: string;
  thresholds?: ThresholdZone;
  title: string;
}

interface AnomalyDotProps {
  cx?: number;
  cy?: number;
  payload?: TelemetryRow;
}

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
  dataKey: NumericTelemetryKey;
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

function getInsight(status: "Normal" | "Warning" | "Critical", title: string): string {
  if (status === "Normal") return "Within normal operating range";
  if (status === "Warning") return `${title} approaching threshold`;
  return `Critical — check ${title.toLowerCase()} sensor`;
}

function linearExtrapolate(data: TelemetryRow[], key: NumericTelemetryKey, projCount: number): Array<TelemetryRow & { _projected: true }> {
  if (data.length < 5) return [];
  const last5 = data
    .slice(-5)
    .map((d, i) => ({ x: i, y: d[key] }))
    .filter((p): p is { x: number; y: number } => p.y != null);
  if (last5.length < 2) return [];
  const n = last5.length;
  const sumX = last5.reduce((a, p) => a + p.x, 0);
  const sumY = last5.reduce((a, p) => a + p.y, 0);
  const sumXY = last5.reduce((a, p) => a + p.x * p.y, 0);
  const sumXX = last5.reduce((a, p) => a + p.x * p.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const lastX = last5[last5.length - 1].x;
  const results = [];
  for (let i = 1; i <= projCount; i++) {
    results.push({
      id: `proj_${i}`,
      device_id: "",
      created_at: `proj_${i}`,
      temperature: null,
      voltage: null,
      current: null,
      gyro_x: null,
      gyro_y: null,
      gyro_z: null,
      is_anomaly: false,
      anomaly_reason: null,
      [key]: intercept + slope * (lastX + i),
      _projected: true,
    });
  }
  return results;
}

const CustomTooltip = ({ active, payload, unit, normalRange, thresholds, title }: CustomTooltipProps) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  if (d._projected) return null;
  const val = payload[0].value;
  const status = getStatus(val, thresholds);
  const statusColors = { Normal: "text-primary", Warning: "text-yellow-400", Critical: "text-destructive" };
  return (
    <div className="rounded-xl border border-border/30 bg-card/90 backdrop-blur-md px-3 py-2 text-xs shadow-lg min-w-[160px]">
      <p className="text-foreground font-semibold">{typeof val === "number" ? val.toFixed(2) : "N/A"} {unit}</p>
      <p className="text-muted-foreground">{new Date(d.created_at).toLocaleTimeString()}</p>
      <p className={`font-medium ${statusColors[status]}`}>{status}</p>
      <p className="text-muted-foreground/70 text-[10px] mt-0.5 italic">{getInsight(status, title)}</p>
      {normalRange && <p className="text-muted-foreground/60 mt-0.5">Range: {normalRange}</p>}
      {d.is_anomaly && <p className="text-destructive font-semibold mt-1">⚠ Anomaly Detected</p>}
    </div>
  );
};

const AnomalyDot = ({ cx, cy, payload }: AnomalyDotProps) => {
  if (!payload?.is_anomaly) return null;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
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
  const latestValue = visibleData.length > 0 ? visibleData[visibleData.length - 1][dataKey] : null;
  const prevValue = visibleData.length > 1 ? visibleData[visibleData.length - 2][dataKey] : null;
  const hasAnomaly = visibleData.length > 0 && visibleData[visibleData.length - 1]?.is_anomaly;
  const fillGradientId = `fill-${dataKey}`;
  const strokeGradientId = `stroke-${dataKey}`;

  const changePercent = useMemo(() => {
    if (latestValue == null || prevValue == null || prevValue === 0) return null;
    return ((latestValue - prevValue) / Math.abs(prevValue)) * 100;
  }, [latestValue, prevValue]);

  const chartData = useMemo(() => {
    const projected = linearExtrapolate(visibleData, dataKey, 2);
    return [...visibleData, ...projected];
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
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={strokeGradientId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 20% 30% / 0.15)" />
                <XAxis dataKey="created_at" hide />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={35} />
                <Tooltip content={<CustomTooltip unit={unit} normalRange={normalRange} thresholds={thresholds} title={title} />} />

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

                {/* Main area with gradient stroke */}
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={`url(#${strokeGradientId})`}
                  strokeWidth={2}
                  fill={`url(#${fillGradientId})`}
                  dot={<AnomalyDot />}
                  activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "hsl(var(--background))" }}
                  animationDuration={400}
                  isAnimationActive
                  connectNulls={false}
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