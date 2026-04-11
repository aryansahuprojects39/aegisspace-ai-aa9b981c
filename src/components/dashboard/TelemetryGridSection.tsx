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
    />
    <GyroscopeGraph data={data} loading={loading} />
  </div>
);

export default TelemetryGridSection;
