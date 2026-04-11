import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

export function useAnomalyNotifications() {
  const { user } = useAuth();
  const seenIds = useRef(new Set<string>());

  useEffect(() => {
    if (!user) return;

    const prefs = localStorage.getItem(`notif_prefs_${user.id}`);
    const parsed = prefs ? JSON.parse(prefs) : { anomalyAlerts: true, soundAlerts: true };

    if (!parsed.anomalyAlerts) return;

    const channel = supabase
      .channel("anomaly-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telemetry_data" },
        (payload) => {
          const row = payload.new as TelemetryRow;
          if (!row.is_anomaly) return;
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);

          toast.error(`⚠️ Anomaly Detected — ${row.anomaly_reason || "Abnormal reading"}`, {
            description: `Device: ${row.device_id} | Temp: ${row.temperature?.toFixed(1)}°C | V: ${row.voltage?.toFixed(1)}V`,
            duration: 8000,
          });

          if (parsed.soundAlerts) {
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 880;
              osc.type = "sine";
              gain.gain.value = 0.15;
              osc.start();
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
              osc.stop(ctx.currentTime + 0.5);
            } catch {}
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
}
