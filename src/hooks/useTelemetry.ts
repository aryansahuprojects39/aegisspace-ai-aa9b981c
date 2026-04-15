import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type TelemetryRow = Tables<"telemetry_data">;

// 30 min — shows historical rows when no live ESP32. Tighten to 60s for prod.
const ACTIVE_WINDOW_MS = 30 * 60 * 1000;

const makeIsFresh = (windowMs: number) =>
  (row: Pick<TelemetryRow, "created_at">) => {
    const ts = new Date(row.created_at).getTime();
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts <= windowMs;
  };

const isFresh = makeIsFresh(ACTIVE_WINDOW_MS);

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

// deviceId optional — omit to show ALL devices (safe while IDs mismatched)
export function useTelemetry(limit = 50, deviceId?: string) {
  const [data, setData]       = useState<TelemetryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const cancelRef             = useRef(false);

  const fetchLatest = async (isRetry = false): Promise<void> => {
    cancelRef.current = false;
    setLoading(true);
    setError(null);
    const sinceIso = new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString();

    let query = supabase
      .from("telemetry_data")
      .select("*")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (deviceId) query = query.eq("device_id", deviceId);  // ← NEW

    const { data: rows, error: fetchError } = await query;
    if (cancelRef.current) return;

    if (fetchError) {
      if (!isRetry) { setTimeout(() => fetchLatest(true), 2000); return; }
      console.error("useTelemetry fetch error:", fetchError.message);
      setError(fetchError.message);
    } else if (rows) {
      setData(rows.filter(isFresh).reverse());
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
          if (deviceId && incoming.device_id !== deviceId) return;

          setData((prev) => {
            const next = [...prev.filter(isFresh), incoming];
            return next.length > limit ? next.slice(next.length - limit) : next;
          });
        }
      )
      .subscribe();

    const pruneTimer = setInterval(() => {
      setData((prev) => prev.filter(isFresh));
    }, 5000);

    return () => {
      cancelRef.current = true;
      clearInterval(pruneTimer);
      supabase.removeChannel(channel);
    };
  }, [limit, deviceId]);

  return { data, loading, error, refetch: () => fetchLatest() };
}

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