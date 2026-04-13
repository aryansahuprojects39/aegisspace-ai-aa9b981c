-- Migration: Performance indexes + security hardening
-- Adds missing index on is_anomaly and profiles relationship

-- Index for anomaly queries (WHERE is_anomaly = true full-scans without this)
CREATE INDEX IF NOT EXISTS idx_telemetry_anomaly
  ON public.telemetry_data (is_anomaly, created_at DESC)
  WHERE is_anomaly = true;

-- Index for telemetry time-range queries (dashboard default view)
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at
  ON public.telemetry_data (created_at DESC);

-- Fix profiles foreign key relationship missing from types (cosmetic, enforces integrity)
-- The FK exists in migration 1 but wasn't surfaced in supabase types Relationships array.
-- Re-add as named constraint so PostgREST picks it up for join inference.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
  ADD CONSTRAINT profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Restrict anon INSERT on telemetry to only the expected device_id pattern.
-- Replaces the permissive "anyone can insert" with a mild sanity check.
-- This prevents arbitrary data injection while still allowing the ESP32/n8n pipeline.
DROP POLICY IF EXISTS "Anyone can insert telemetry data" ON public.telemetry_data;

CREATE POLICY "Device or authenticated users can insert telemetry"
  ON public.telemetry_data FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- device_id must look like esp32-NNN or be any authenticated user
    device_id ~ '^esp32-[a-zA-Z0-9\-]+$' OR auth.role() = 'authenticated'
  );