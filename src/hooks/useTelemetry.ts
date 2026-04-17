import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;
const ACTIVE_WINDOW_MS = 10 * 60 * 1000; // 10 min rolling window — was 60 s which wiped the graph after 1 min

const isFresh = (row: Pick<TelemetryRow, "created_at">) => {
  const ts = new Date(row.created_at).getTime();
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts <= ACTIVE_WINDOW_MS;
};

/**
 * useTelemetry
 * Fetches the latest `limit` telemetry rows and subscribes to new INSERTs
 * via Supabase Realtime. Cleans up properly on unmount or when `limit` changes.
 *
 * Fixes over original:
 *  - Cancels in-flight fetch on cleanup (avoids setState on unmounted component)
 *  - Retries initial fetch once on transient error (network hiccup on mount)
 *  - Exposes `refetch()` so callers can manually refresh (e.g. after CSV export)
 */
export function useTelemetry(limit = 50) {
  const [data, setData]       = useState<TelemetryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const cancelRef             = useRef(false);

  const fetchLatest = async (isRetry = false): Promise<void> => {
    cancelRef.current = false;
    setLoading(true);
    setError(null);
    const sinceIso = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();

    const { data: rows, error: fetchError } = await supabase
      .from("telemetry_data")
      .select("*")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cancelRef.current) return; // component unmounted mid-fetch

    if (fetchError) {
      if (!isRetry) {
        // Single automatic retry after 2 s
        setTimeout(() => fetchLatest(true), 2000);
        return;
      }
      console.error("useTelemetry fetch error:", fetchError.message);
      setError(fetchError.message);
    } else if (rows) {
      setData(rows.filter(isFresh).reverse()); // oldest-first for chart rendering
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLatest();

    const channel = supabase
      .channel("telemetry-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "telemetry_data" },
        (payload) => {
          const incoming = payload.new as TelemetryRow;
          if (!isFresh(incoming)) return;

          setData((prev) => {
            const next = [...prev.filter(isFresh), incoming];
            // Keep only the most recent `limit` rows
            return next.length > limit ? next.slice(next.length - limit) : next;
          });
        },
      )
      .subscribe();

    const pruneTimer = setInterval(() => {
      setData((prev) => prev.filter(isFresh));
    }, 5000);

    return () => {
      cancelRef.current = true; // cancel any in-flight fetch
      clearInterval(pruneTimer);
      supabase.removeChannel(channel);
    };
  }, [limit]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: () => fetchLatest() };
}