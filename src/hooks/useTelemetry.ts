import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

export function useTelemetry(limit = 50) {
  const [data, setData] = useState<TelemetryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    supabase
      .from("telemetry_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data: rows, error: fetchError }) => {
        if (fetchError) {
          console.error("useTelemetry fetch error:", fetchError.message);
          setError(fetchError.message);
        } else if (rows) {
          setData(rows.reverse());
        }
        setLoading(false);
      });

    // Realtime subscription
    const channel = supabase
      .channel("telemetry-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telemetry_data" },
        (payload) => {
          setData((prev) => {
            const next = [...prev, payload.new as TelemetryRow];
            return next.slice(-limit);
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [limit]);

  return { data, loading, error };
}