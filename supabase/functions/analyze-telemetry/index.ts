// Supabase Edge Function: analyze-telemetry
// Deploy: npx supabase functions deploy analyze-telemetry
//
// NOTE on Deno imports:
// supabase-edge-runtime does NOT expose Deno.serve() as a global.
// Use the explicit std import below. Pin to 0.224.0 (current stable).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Matches real DB schema: telemetry_readings columns
interface TelemetryReading {
  id: string;
  device_id: string;
  temperature1: number;
  temperature2: number;
  voltage: number;
  current: number;
  vibration: number;
  rf_signal: number;
  motion_detected: boolean | null;
  rf_interference: boolean | null;
  status: string | null;
  anomaly_score: number | null;
  sabotage_probability: number | null;
  created_at: string;
}

interface AnalysisResponse {
  status: "nominal" | "warning" | "critical";
  summary: string;
  details: string;
  risks: string[];
  recommendation: string;
}

const FALLBACK: AnalysisResponse = {
  status: "nominal",
  summary: "Unable to parse AI response.",
  details: "",
  risks: [],
  recommendation: "Retry analysis.",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  // --- Input validation ---
  let telemetryData: TelemetryReading[];
  try {
    const body = await req.json();
    if (!Array.isArray(body?.telemetryData) || body.telemetryData.length === 0) {
      return json({ error: "telemetryData must be a non-empty array." }, 400);
    }
    telemetryData = (body.telemetryData as TelemetryReading[]).slice(-100);
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("analyze-telemetry: LOVABLE_API_KEY not set");
    return json({ error: "Server misconfiguration." }, 500);
  }

  // --- Build prompt using real column names ---
  const anomalies = telemetryData.filter(
    (r) => r.status === "warning" || r.status === "critical" || (r.anomaly_score ?? 0) > 0,
  );
  const recent = telemetryData.slice(-5);

  const prompt =
    `You are AegisSpace AI, an expert satellite launch telemetry analyst.\n` +
    `Analyse the following ESP32 FLARE sensor readings and return a concise assessment.\n\n` +
    `Total readings: ${telemetryData.length}\n` +
    `Anomalies flagged: ${anomalies.length}\n` +
    `Last 5 readings:\n${JSON.stringify(recent, null, 2)}\n\n` +
    `Fields: temperature1/temperature2 (°C), voltage (V), current (A), ` +
    `vibration, rf_signal, motion_detected, rf_interference, ` +
    `status, anomaly_score (0-1), sabotage_probability (0-1).\n\n` +
    `Respond ONLY with a valid JSON object - no markdown fences:\n` +
    `{\n` +
    `  "status": "nominal" | "warning" | "critical",\n` +
    `  "summary": "<one-line status>",\n` +
    `  "details": "<2-3 sentences>",\n` +
    `  "risks": ["<risk1>", "<risk2>"],\n` +
    `  "recommendation": "<single action>"\n` +
    `}`;

  // --- Call AI gateway ---
  let aiResponse: Response;
  try {
    aiResponse = await fetchWithTimeout(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash",
          max_tokens: 512,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are a spacecraft telemetry analyst AI. Respond with valid JSON only. No markdown.",
            },
            { role: "user", content: prompt },
          ],
        }),
      },
      15_000,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("aborted")) {
      return json({ error: "AI gateway timed out. Retry shortly." }, 504);
    }
    console.error("analyze-telemetry fetch error:", msg);
    return json({ error: "Failed to reach AI gateway." }, 502);
  }

  if (!aiResponse.ok) {
    const s = aiResponse.status;
    if (s === 429) return json({ error: "Rate limited. Retry shortly." }, 429);
    if (s === 402) return json({ error: "AI credits exhausted." }, 402);
    if (s === 401) return json({ error: "AI gateway auth failed." }, 500);
    return json({ error: `AI gateway error: ${s}` }, 502);
  }

  // --- Parse AI response ---
  let analysis: AnalysisResponse;
  try {
    const result = await aiResponse.json();
    const content: string = result.choices?.[0]?.message?.content ?? "{}";
    const cleaned = content.replace(/```(?:json)?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    const parsed = JSON.parse(match[0]) as Partial<AnalysisResponse>;
    analysis = {
      status:
        parsed.status === "warning" || parsed.status === "critical"
          ? parsed.status
          : "nominal",
      summary: typeof parsed.summary === "string" ? parsed.summary : content,
      details: typeof parsed.details === "string" ? parsed.details : "",
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      recommendation:
        typeof parsed.recommendation === "string" ? parsed.recommendation : "",
    };
  } catch (e) {
    console.warn("analyze-telemetry: parse failed:", e);
    analysis = FALLBACK;
  }

  return json(analysis);
});