-- Allow dashboard viewers to read telemetry stream data.
-- Keep INSERT restrictions in the existing insert policy migration.
DROP POLICY IF EXISTS "Authenticated users can view telemetry" ON public.telemetry_data;

CREATE POLICY "Public can view telemetry"
	ON public.telemetry_data FOR SELECT
	TO anon, authenticated
	USING (true);
