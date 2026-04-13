import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

type GyroKey = "gyro_x" | "gyro_y" | "gyro_z";
type GyroDatum = Pick<TelemetryRow, "created_at" | "is_anomaly" | GyroKey> & {
  _projected?: boolean;
};

interface TooltipPayloadItem {
  payload: GyroDatum;
  dataKey: string;
  color: string;
  name: string;
  value: number | null;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const COLORS: Record<GyroKey, string> = { gyro_x: "#6EF3FF", gyro_y: "#FF6BD6", gyro_z: "#A66CFF" };
const LABELS: Record<GyroKey, string> = { gyro_x: "X", gyro_y: "Y", gyro_z: "Z" };

const TIME_RANGES = [
  { label: "10s", points: 10 },
  { label: "30s", points: 30 },
  { label: "All", points: 50 },
] as const;

function linearExtrapolate(data: GyroDatum[], key: GyroKey, projCount: number): Array<Pick<GyroDatum, GyroKey>> {
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
  const results: Array<Pick<GyroDatum, GyroKey>> = [];
  for (let i = 1; i <= projCount; i++) {
    results.push({ [key]: intercept + slope * (lastX + i) });
  }
  return results;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (d?._projected) return null;
  return (
    <div className="rounded-xl border border-border/30 bg-card/90 backdrop-blur-md px-3 py-2 text-xs shadow-lg">
      {d?.created_at && <p className="text-muted-foreground mb-1">{new Date(d.created_at).toLocaleTimeString()}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : "N/A"}°/s
        </p>
      ))}
      {d?.is_anomaly && <p className="text-destructive font-semibold mt-1">⚠ Anomaly Detected</p>}
    </div>
  );
};

const GyroscopeGraph = ({ data, loading }: { data: TelemetryRow[]; loading: boolean }) => {
  const [range, setRange] = useState<number>(50);
  const [visibleAxes, setVisibleAxes] = useState({ gyro_x: true, gyro_y: true, gyro_z: true });

  const visibleData = useMemo(() => data.slice(-range), [data, range]);
  const latest = visibleData.length > 0 ? visibleData[visibleData.length - 1] : null;
  const hasAnomaly = latest?.is_anomaly;

  const toggleAxis = (axis: keyof typeof visibleAxes) => {
    setVisibleAxes((prev) => ({ ...prev, [axis]: !prev[axis] }));
  };

  // Build chart data with projected points
  const chartData = useMemo(() => {
    if (visibleData.length < 5) return visibleData;
    const projX = linearExtrapolate(visibleData, "gyro_x", 2);
    const projY = linearExtrapolate(visibleData, "gyro_y", 2);
    const projZ = linearExtrapolate(visibleData, "gyro_z", 2);
    const projected = [0, 1].map(i => ({
      created_at: `proj_${i}`,
      _projected: true,
      gyro_x: projX[i]?.gyro_x ?? null,
      gyro_y: projY[i]?.gyro_y ?? null,
      gyro_z: projZ[i]?.gyro_z ?? null,
    }));
    return [...visibleData, ...projected];
  }, [visibleData]);

  const anomalyTimestamps = useMemo(
    () => visibleData.filter((d) => d.is_anomaly).map((d) => d.created_at),
    [visibleData]
  );

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
          ? "0 0 24px hsl(0, 80%, 55% / 0.25)"
          : "0 4px 24px #A66CFF10, inset 0 1px 0 hsl(0 0% 100% / 0.03)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
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

      {/* Controls row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
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
        <div className="flex gap-1.5">
          {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((axis) => (
            <button
              key={axis}
              onClick={() => toggleAxis(axis)}
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono transition-all ${visibleAxes[axis] ? "opacity-100" : "opacity-30 line-through"}`}
              style={{ color: COLORS[axis], background: visibleAxes[axis] ? `${COLORS[axis]}15` : "transparent" }}
            >
              {LABELS[axis]}
            </button>
          ))}
        </div>
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
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  {(Object.keys(COLORS) as Array<keyof typeof COLORS>).map((axis) => (
                    <linearGradient key={axis} id={`stroke-${axis}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={COLORS[axis]} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={COLORS[axis]} stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 20% 30% / 0.15)" />
                <XAxis dataKey="created_at" hide />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} width={35} />
                <Tooltip content={<CustomTooltip />} />
                {anomalyTimestamps.map((ts) => (
                  <ReferenceLine key={ts} x={ts} stroke="hsl(0, 80%, 55%)" strokeDasharray="4 4" strokeOpacity={0.5} />
                ))}
                {visibleAxes.gyro_x && <Line type="monotone" dataKey="gyro_x" name="X" stroke={`url(#stroke-gyro_x)`} strokeWidth={1.5} dot={false} animationDuration={400} connectNulls={false} />}
                {visibleAxes.gyro_y && <Line type="monotone" dataKey="gyro_y" name="Y" stroke={`url(#stroke-gyro_y)`} strokeWidth={1.5} dot={false} animationDuration={400} connectNulls={false} />}
                {visibleAxes.gyro_z && <Line type="monotone" dataKey="gyro_z" name="Z" stroke={`url(#stroke-gyro_z)`} strokeWidth={1.5} dot={false} animationDuration={400} connectNulls={false} />}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GyroscopeGraph;
