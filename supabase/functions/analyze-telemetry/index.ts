declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

// AegisSpace — analyze-telemetry Edge Function
// AI backend: Anthropic Claude (claude-sonnet-4-6) called directly.
// Secret required: ANTHROPIC_API_KEY
// Set via: npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-... \
//            --project-ref uidfafhxwjrdxngicaro

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TelemetryReading {
  id: string;
  device_id: string;
  temperature: number | null;
  voltage: number | null;
  current: number | null;
  gyro_x: number | null;
  gyro_y: number | null;
  gyro_z: number | null;
  is_anomaly: boolean;
  anomaly_reason: string | null;
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

Deno.serve(async (req: Request) => {
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

  // --- Secret ---
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    console.error("analyze-telemetry: ANTHROPIC_API_KEY not set");
    return json({ error: "Server misconfiguration." }, 500);
  }

  // --- Build prompt ---
  const anomalies = telemetryData.filter((r) => r.is_anomaly);
  const recent    = telemetryData.slice(-5);

  const prompt =
    `You are AegisSpace AI, an expert satellite launch telemetry analyst.\n` +
    `Analyse the following ESP32 FLARE sensor readings and return a concise mission assessment.\n\n` +
    `Total readings in session: ${telemetryData.length}\n` +
    `Anomalies flagged: ${anomalies.length}\n\n` +
    `Last 5 readings:\n${JSON.stringify(recent, null, 2)}\n\n` +
    `Fields: temperature (degC), voltage (V), current (A), ` +
    `gyro_x/y/z (deg/s), is_anomaly, anomaly_reason.\n\n` +
    `Normal operating ranges: temp 15-70C, voltage 3.0-5.5V, ` +
    `current 0-2A, gyro magnitude < 250 deg/s.\n\n` +
    `Respond ONLY with a valid JSON object. No markdown fences. No explanation outside JSON:\n` +
    `{\n` +
    `  "status": "nominal" | "warning" | "critical",\n` +
    `  "summary": "<one concise line>",\n` +
    `  "details": "<2-3 sentences of analysis>",\n` +
    `  "risks": ["<risk1>", "<risk2>"],\n` +
    `  "recommendation": "<single most important action>"\n` +
    `}`;

  // --- Call Anthropic API directly ---
  let aiResponse: Response;
  try {
    aiResponse = await fetchWithTimeout(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "x-api-key":         ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type":      "application/json",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-6",
          max_tokens: 512,
          system:     "You are a spacecraft telemetry analyst AI. Always respond with valid JSON only. Never include markdown code fences or any text outside the JSON object.",
          messages: [{ role: "user", content: prompt }],
        }),
      },
      20_000, // 20 s — Anthropic can be slower than gateway
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("aborted")) {
      console.error("analyze-telemetry: Anthropic API timed out");
      return json({ error: "AI timed out. Retry shortly." }, 504);
    }
    console.error("analyze-telemetry: fetch error:", msg);
    return json({ error: "Failed to reach Anthropic API." }, 502);
  }

  if (!aiResponse.ok) {
    const s = aiResponse.status;
    const body = await aiResponse.json().catch(() => ({}));
    console.error(`analyze-telemetry: Anthropic returned ${s}`, body);
    if (s === 429) return json({ error: "Rate limited. Retry shortly." }, 429);
    if (s === 401) return json({ error: "Anthropic API key invalid." }, 500);
    if (s === 400) return json({ error: "Bad request to Anthropic API." }, 500);
    return json({ error: `Anthropic API error: ${s}` }, 502);
  }

  // --- Parse Anthropic response ---
  // Anthropic format: { content: [{ type: "text", text: "..." }] }
  let analysis: AnalysisResponse;
  try {
    const result  = await aiResponse.json();
    const content: string = result.content?.[0]?.text ?? "{}";
    const cleaned = content.replace(/```(?:json)?/g, "").trim();
    const match   = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in Claude response");
    const parsed  = JSON.parse(match[0]) as Partial<AnalysisResponse>;
    analysis = {
      status:
        parsed.status === "warning" || parsed.status === "critical"
          ? parsed.status
          : "nominal",
      summary:        typeof parsed.summary        === "string" ? parsed.summary        : content,
      details:        typeof parsed.details        === "string" ? parsed.details        : "",
      risks:          Array.isArray(parsed.risks)               ? parsed.risks          : [],
      recommendation: typeof parsed.recommendation === "string" ? parsed.recommendation : "",
    };
  } catch (e) {
    console.warn("analyze-telemetry: parse failed:", e);
    analysis = FALLBACK;
  }

  return json(analysis);
});