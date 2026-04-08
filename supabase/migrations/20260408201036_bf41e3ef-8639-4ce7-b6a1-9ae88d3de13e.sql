
-- Create telemetry_data table
CREATE TABLE public.telemetry_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL DEFAULT 'esp32-001',
  temperature DOUBLE PRECISION,
  voltage DOUBLE PRECISION,
  current DOUBLE PRECISION,
  gyro_x DOUBLE PRECISION,
  gyro_y DOUBLE PRECISION,
  gyro_z DOUBLE PRECISION,
  is_anomaly BOOLEAN NOT NULL DEFAULT false,
  anomaly_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telemetry_data ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all telemetry data
CREATE POLICY "Authenticated users can view telemetry"
ON public.telemetry_data FOR SELECT
TO authenticated
USING (true);

-- Allow inserts from anyone (for n8n webhook / ESP32)
CREATE POLICY "Anyone can insert telemetry data"
ON public.telemetry_data FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.telemetry_data;

-- Index for performance
CREATE INDEX idx_telemetry_device_time ON public.telemetry_data (device_id, created_at DESC);
