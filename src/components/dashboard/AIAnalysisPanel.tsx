import { useState, useEffect, useCallback, useRef } from "react";
import { Brain, AlertTriangle, CheckCircle, XCircle, RefreshCw, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

export interface AIAnalysis {
  status: "nominal" | "warning" | "critical";
  summary: string;
  details: string;
  risks: string[];
  recommendation: string;
}

interface AIAnalysisPanelProps {
  telemetry: TelemetryRow[];
  /** Called each time a new analysis completes — used by parent to build history */
  onAnalysisComplete?: (analysis: AIAnalysis, timestamp: string) => void;
}

const REMOTE_AI_ENABLED = import.meta.env.VITE_ENABLE_REMOTE_AI_ANALYSIS === "true";

// BUG FIX: was a single generic recommendation based only on status level.
// That meant a temperature anomaly showed the same text as a current/voltage anomaly.
// Now picks the most severe detected risk and gives a specific recommendation.
const buildSpecificRecommendation = (risks: string[], status: AIAnalysis["status"]): string => {
  if (status === "nominal") return "No action required beyond standard monitoring cadence.";
  const r = risks.join(" ").toLowerCase();
  if (r.includes("critical temp") || r.includes("high temp"))
    return "Reduce computational load and check thermal management — temperature approaching danger zone.";
  if (r.includes("overvoltage") || r.includes("low voltage"))
    return "Inspect power supply rail and battery connections — voltage outside safe operating range.";
  if (r.includes("overcurrent"))
    return "Check for short circuits or overloaded components drawing excess current.";
  if (r.includes("angular") || r.includes("vibration"))
    return "Verify structural mounting integrity — high angular rate or vibration detected.";
  if (r.includes("rf") || r.includes("motion"))
    return "Investigate RF environment and motion source — possible interference or physical disturbance.";
  // fallback
  return status === "critical"
    ? "Pause mission-critical operations and inspect all hardware sensors immediately."
    : "Continue monitoring and schedule a subsystem check if trend persists.";
};

export const buildLocalAnalysis = (rows: TelemetryRow[]): AIAnalysis => {
  const latest = rows[rows.length - 1];
  if (!latest) {
    return {
      status: "nominal",
      summary: "No telemetry available.",
      details: "Awaiting live readings from the FLARE module.",
      risks: [],
      recommendation: "Keep monitoring dashboard stream.",
    };
  }

  const risks: string[] = [];
  const temp = latest.temperature ?? 0;
  const voltage = latest.voltage ?? 0;
  const current = latest.current ?? 0;
  const gyroMag = Math.sqrt(
    (latest.gyro_x ?? 0) ** 2 + (latest.gyro_y ?? 0) ** 2 + (latest.gyro_z ?? 0) ** 2
  );

  if (temp >= 85) risks.push(`Critical temperature (${temp.toFixed(1)} C)`);
  else if (temp >= 70) risks.push(`High temperature (${temp.toFixed(1)} C)`);

  if (voltage < 3.0) risks.push(`Low voltage (${voltage.toFixed(2)} V)`);
  else if (voltage > 5.5) risks.push(`Overvoltage (${voltage.toFixed(2)} V)`);

  if (current > 2.0) risks.push(`Overcurrent (${current.toFixed(3)} A)`);
  if (gyroMag > 250) risks.push(`High angular rate (${gyroMag.toFixed(1)} deg/s)`);
  if (latest.is_anomaly) risks.push(latest.anomaly_reason ?? "Device flagged anomaly");

  const status: AIAnalysis["status"] =
    risks.some((r) => r.toLowerCase().includes("critical")) || latest.is_anomaly
      ? "critical"
      : risks.length > 0
        ? "warning"
        : "nominal";

  return {
    status,
    summary:
      status === "critical"
        ? "Immediate attention required for current telemetry state."
        : status === "warning"
          ? "Telemetry drift detected; review subsystem thresholds."
          : "All monitored parameters are within expected operating range.",
    details: `Latest sample from ${latest.device_id} at ${new Date(latest.created_at).toLocaleString()}. T:${temp.toFixed(1)}°C V:${voltage.toFixed(2)}V I:${current.toFixed(3)}A Gyro:${gyroMag.toFixed(1)}°/s`,
    risks,
    recommendation: buildSpecificRecommendation(risks, status),
  };
};

const AIAnalysisPanel = ({ telemetry, onAnalysisComplete }: AIAnalysisPanelProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the latest telemetry so runAnalysis always uses fresh data
  // even when called from a debounced closure
  const telemetryRef = useRef(telemetry);
  useEffect(() => { telemetryRef.current = telemetry; }, [telemetry]);

  // Track last analyzed data length to avoid redundant runs
  const lastAnalyzedLenRef = useRef(0);

  // Ensure onAnalysisComplete is always up-to-date and stable
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  useEffect(() => { onAnalysisCompleteRef.current = onAnalysisComplete; }, [onAnalysisComplete]);

  const runAnalysis = useCallback(async () => {
    const current = telemetryRef.current;
    if (current.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      let result: AIAnalysis;

      if (!REMOTE_AI_ENABLED) {
        result = buildLocalAnalysis(current.slice(-10));
      } else {
        const { data, error: fnError } = await supabase.functions.invoke("analyze-telemetry", {
          body: { telemetryData: current.slice(-10) },
        });
        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);
        result = data as AIAnalysis;
      }

      setAnalysis(result);
      onAnalysisCompleteRef.current?.(result, new Date().toISOString());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // FIX: Auto-refresh on every new telemetry point (like the graphs).
  // Previously had `if (!analysis)` guard which only ran once.
  // Now triggers whenever telemetry.length changes, with 2s debounce.
  useEffect(() => {
    if (telemetry.length === 0) return;
    // Skip if no new data since last analysis
    if (telemetry.length === lastAnalyzedLenRef.current) return;

    const timer = setTimeout(() => {
      lastAnalyzedLenRef.current = telemetryRef.current.length;
      runAnalysis();
    }, 2000);

    return () => clearTimeout(timer);
  }, [telemetry.length, runAnalysis]);

  const statusIcon =
    analysis?.status === "critical"
      ? XCircle
      : analysis?.status === "warning"
        ? AlertTriangle
        : CheckCircle;
  const StatusIcon = statusIcon;
  const statusColor =
    analysis?.status === "critical"
      ? "text-destructive"
      : analysis?.status === "warning"
        ? "text-yellow-400"
        : "text-primary";
  const statusBg =
    analysis?.status === "critical"
      ? "bg-destructive/10 border-destructive/20"
      : analysis?.status === "warning"
        ? "bg-yellow-400/10 border-yellow-400/20"
        : "bg-primary/10 border-primary/20";

  return (
    <div className="glass rounded-2xl p-4 card-tilt h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-heading font-semibold text-foreground">AI Analysis</span>
          {loading && (
            <span className="text-[9px] text-muted-foreground/60 font-mono animate-pulse">live</span>
          )}
        </div>
        <button
          onClick={() => {
            lastAnalyzedLenRef.current = 0; // allow force re-run
            runAnalysis();
          }}
          disabled={loading || telemetry.length === 0}
          className="text-xs text-primary hover:text-primary/80 disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {telemetry.length === 0 ? (
        <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-xl">
          <span className="text-xs text-muted-foreground/50">Waiting for telemetry data…</span>
        </div>
      ) : analysis ? (
        <div className="space-y-3 flex-1">
          {/* Status badge */}
          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg border ${statusBg}`}>
            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
            <span className={`text-xs font-semibold ${statusColor}`}>
              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
            </span>
            <Zap className="w-3 h-3 text-muted-foreground/40 ml-auto" />
            <span className="text-[9px] text-muted-foreground/40 font-mono">auto</span>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Summary</div>
            <div className="text-xs text-foreground">{analysis.summary}</div>
          </div>

          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Details</div>
            <div className="text-xs text-foreground/80 leading-relaxed">{analysis.details}</div>
          </div>

          {analysis.risks.length > 0 && (
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">Risks</div>
              <ul className="space-y-1">
                {analysis.risks.map((risk, i) => (
                  <li key={i} className="text-[10px] text-destructive flex items-start gap-1">
                    <span>•</span>{risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-[10px] text-muted-foreground mb-0.5">Recommendation</div>
            <div className="text-xs text-primary">{analysis.recommendation}</div>
          </div>
        </div>
      ) : error ? (
        <div className="text-xs text-destructive">{error}</div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-muted-foreground/30" />
          <span className="text-xs text-muted-foreground/50">Click "Analyze" to run AI assessment</span>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;