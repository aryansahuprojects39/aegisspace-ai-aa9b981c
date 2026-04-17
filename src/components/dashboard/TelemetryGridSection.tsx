import { Thermometer, Zap, Activity } from "lucide-react";
import TelemetryGraph from "./TelemetryGraph";
import GyroscopeGraph from "./GyroscopeGraph";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

interface Props {
  data: TelemetryRow[];
  loading: boolean;
}

const TelemetryGridSection = ({ data, loading }: Props) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <TelemetryGraph
      title="Temperature"
      icon={Thermometer}
      dataKey="temperature"
      color="#FF6B6B"
      unit="°C"
      normalRange="15–45 °C"
      data={data}
      loading={loading}
      thresholds={{ low: 15, high: 45, warningLow: 10, warningHigh: 50, criticalLow: 0, criticalHigh: 60 }}
      anomalyKeys={["critical_temp1", "high_temp1"]}
    />
    <TelemetryGraph
      title="Voltage"
      icon={Zap}
      dataKey="voltage"
      color="#6EF3FF"
      unit="V"
      normalRange="3.0–5.0 V"
      data={data}
      loading={loading}
      thresholds={{ low: 3.0, high: 5.0, warningLow: 2.5, warningHigh: 5.5, criticalLow: 2.0, criticalHigh: 6.0 }}
      anomalyKeys={["low_voltage", "overvoltage"]}
    />
    <TelemetryGraph
      title="Current"
      icon={Activity}
      dataKey="current"
      color="#FFD93D"
      unit="A"
      normalRange="0.1–2.0 A"
      data={data}
      loading={loading}
      thresholds={{ low: 0.1, high: 2.0, warningLow: 0.05, warningHigh: 2.5, criticalLow: 0, criticalHigh: 3.0 }}
      anomalyKeys={["overcurrent"]}
    />
    <GyroscopeGraph data={data} loading={loading} />
  </div>
);

export default TelemetryGridSection;