import { useState, useEffect, useCallback } from "react";
import { Brain, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

interface AIAnalysis {
  status: "nominal" | "warning" | "critical";
  summary: string;
  details: string;
  risks: string[];
  recommendation: string;
}

interface AIAnalysisPanelProps {
  telemetry: TelemetryRow[];
}

const REMOTE_AI_ENABLED = import.meta.env.VITE_ENABLE_REMOTE_AI_ANALYSIS === "true";

const buildLocalAnalysis = (rows: TelemetryRow[]): AIAnalysis => {
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
  const gyroMag = Math.sqrt((latest.gyro_x ?? 0) ** 2 + (latest.gyro_y ?? 0) ** 2 + (latest.gyro_z ?? 0) ** 2);

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
    details: `Latest sample from ${latest.device_id} at ${new Date(latest.created_at).toLocaleString()}.`,
    risks,
    recommendation:
      status === "critical"
        ? "Pause mission-critical operations and inspect hardware sensors immediately."
        : status === "warning"
          ? "Continue monitoring and schedule a subsystem check if trend persists."
          : "No action required beyond standard monitoring cadence.",
  };
};

const AIAnalysisPanel = ({ telemetry }: AIAnalysisPanelProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (telemetry.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      if (!REMOTE_AI_ENABLED) {
        setAnalysis(buildLocalAnalysis(telemetry.slice(-10)));
        return;
      }

      const { data, error: fnError } = await supabase.functions.invoke("analyze-telemetry", {
        body: { telemetryData: telemetry.slice(-10) },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setAnalysis(data as AIAnalysis);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [telemetry]);

  // Auto-analyze when new data arrives (debounced)
  useEffect(() => {
    if (telemetry.length === 0) return;
    const timer = setTimeout(() => {
      if (!analysis) runAnalysis();
    }, 3000);
    return () => clearTimeout(timer);
  }, [telemetry.length, runAnalysis, analysis]);

  const statusIcon = analysis?.status === "critical" ? XCircle :
    analysis?.status === "warning" ? AlertTriangle : CheckCircle;
  const StatusIcon = statusIcon;
  const statusColor = analysis?.status === "critical" ? "text-destructive" :
    analysis?.status === "warning" ? "text-yellow-400" : "text-primary";

  return (
    <div className="glass rounded-2xl p-4 card-tilt h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-heading font-semibold text-foreground">AI Analysis</span>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading || telemetry.length === 0}
          className="text-xs text-primary hover:text-primary/80 disabled:opacity-50 flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>

      {telemetry.length === 0 ? (
        <div className="h-40 flex items-center justify-center border border-dashed border-border rounded-xl">
          <span className="text-xs text-muted-foreground/50">Waiting for telemetry data…</span>
        </div>
      ) : analysis ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
            <span className={`text-sm font-semibold ${statusColor}`}>
              {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
            </span>
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
        <div className="h-40 flex flex-col items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-muted-foreground/30" />
          <span className="text-xs text-muted-foreground/50">Click "Analyze" to run AI assessment</span>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisPanel;