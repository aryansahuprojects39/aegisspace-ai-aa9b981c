import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

interface NotifPrefs {
  anomalyAlerts: boolean;
  soundAlerts: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { anomalyAlerts: true, soundAlerts: true };

/**
 * Safe preference loader — never throws on corrupt localStorage data.
 */
function loadPrefs(userId: string): NotifPrefs {
  try {
    const raw = localStorage.getItem(`notif_prefs_${userId}`);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<NotifPrefs>;
    return {
      anomalyAlerts: parsed.anomalyAlerts !== false,
      soundAlerts:   parsed.soundAlerts   !== false,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/**
 * Play a short warning beep via Web Audio API.
 * Reuses a single AudioContext per hook instance to avoid the browser's
 * "too many AudioContext" limit hit by rapid anomalies.
 */
function playBeep(ctx: AudioContext) {
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {}); // user gesture may be needed first time
  }
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value  = 880;
  osc.type             = "sine";
  gain.gain.value      = 0.15;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.stop(ctx.currentTime + 0.55);
}

export function useAnomalyNotifications() {
  const { user } = useAuth();
  const seenIds   = useRef(new Set<string>());
  const audioCtx  = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!user) return;

    const prefs = loadPrefs(user.id);
    if (!prefs.anomalyAlerts) return;

    // Create one AudioContext for the lifetime of this subscription
    if (prefs.soundAlerts && !audioCtx.current) {
      try {
        audioCtx.current = new AudioContext();
      } catch {
        // AudioContext not supported — silent degradation
      }
    }

    const channel = supabase
      .channel("anomaly-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telemetry_data" },
        (payload) => {
          const row = payload.new as TelemetryRow;
          if (!row.is_anomaly)          return;
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);

          toast.error(
            `⚠️ Anomaly — ${row.anomaly_reason ?? "Abnormal reading"}`,
            {
              description: `Device: ${row.device_id} | Temp: ${row.temperature?.toFixed(1) ?? "—"}°C | V: ${row.voltage?.toFixed(2) ?? "—"}V`,
              duration: 8000,
            },
          );

          if (prefs.soundAlerts && audioCtx.current) {
            try {
              playBeep(audioCtx.current);
            } catch {
              // ignore audio failures silently
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      // Close AudioContext when user logs out / component unmounts
      if (audioCtx.current) {
        audioCtx.current.close().catch(() => {});
        audioCtx.current = null;
      }
    };
  }, [user]);
}