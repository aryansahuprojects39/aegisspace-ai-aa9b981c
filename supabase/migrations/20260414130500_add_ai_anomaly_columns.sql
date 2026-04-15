-- Align telemetry_data schema with dashboard types and n8n AI-enriched inserts.
ALTER TABLE public.telemetry_data
  ADD COLUMN IF NOT EXISTS severity TEXT,
  ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION;
