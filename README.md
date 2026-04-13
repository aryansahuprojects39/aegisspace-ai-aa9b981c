# AegisSpace AI

> Mission-critical satellite launch monitoring powered by real FLARE
> module telemetry, AI anomaly detection, and predictive failure
> analysis.

![AegisSpace Dashboard](src/assets/feature-dashboard.jpg)

______________________________________________________________________

## Overview

AegisSpace AI is a full-stack real-time telemetry monitoring platform
built for satellite launch operations. An ESP32-based **FLARE** hardware
module streams sensor data through an **n8n** webhook pipeline into
Supabase, where it is stored, analyzed by an AI engine, and visualized
on a live dashboard — all within milliseconds.

The platform detects anomalies automatically, displays a 3D digital twin
of the launch vehicle, and provides AI-generated mission assessments on
demand.

______________________________________________________________________

## Features

- **Real-Time Telemetry** — Live temperature, voltage, current, and
  gyroscope (X/Y/Z) readings streamed via Supabase Realtime
- **AI Anomaly Detection** — Automatic flagging of out-of-range readings
  with toast notifications and audio alerts
- **AI Mission Analysis** — On-demand analysis powered by Gemini via
  Supabase Edge Functions
- **3D Digital Twin** — Interactive Three.js rocket model that mirrors
  live gyroscope orientation
- **Predictive Trend Lines** — Linear extrapolation overlay on telemetry
  graphs
- **CSV Export** — One-click download of the full telemetry session
- **Secure Auth** — Supabase Auth with Google OAuth, protected routes,
  password strength meter
- **Profile Settings** — Avatar upload, display name, bio with Supabase
  Storage
- **Responsive UI** — Glassmorphism design, parallax stars, mobile-friendly
  layout

______________________________________________________________________

## Tech Stack

| Layer         | Technology                                                   |
| ------------- | ------------------------------------------------------------ |
| Frontend      | React 18, TypeScript, Vite                                   |
| Styling       | Tailwind CSS, shadcn/ui, Framer Motion                       |
| 3D Graphics   | Three.js, React Three Fiber, Drei                            |
| Backend       | Supabase (Postgres, Auth, Realtime, Storage, Edge Functions) |
| AI Engine     | Google Gemini (via Lovable AI Gateway)                       |
| Data Pipeline | n8n webhooks → ESP32 FLARE module                            |
| Charts        | Recharts                                                     |
| Forms         | React Hook Form + Zod                                        |
| Testing       | Vitest, Playwright                                           |

______________________________________________________________________

## Architecture

```text
ESP32 FLARE Module
       │  (HTTP POST sensor readings)
       ▼
   n8n Webhook
       │  (validates + forwards)
       ▼
Supabase Postgres  ──→  Supabase Realtime  ──→  React Dashboard
       │
       ▼
Supabase Edge Function: analyze-telemetry
       │  (Gemini AI assessment)
       ▼
   AI Panel (status / risks / recommendation)
```

______________________________________________________________________

## Database Schema

### `telemetry_data`

| Column           | Type             | Description                                |
| ---------------- | ---------------- | ------------------------------------------ |
| `id`             | UUID             | Primary key                                |
| `device_id`      | TEXT             | Hardware identifier (default: `esp32-001`) |
| `temperature`    | DOUBLE PRECISION | Temperature in °C                          |
| `voltage`        | DOUBLE PRECISION | Supply voltage (V)                         |
| `current`        | DOUBLE PRECISION | Current draw (A)                           |
| `gyro_x/y/z`     | DOUBLE PRECISION | Gyroscope axes (°/s)                       |
| `is_anomaly`     | BOOLEAN          | Flagged by anomaly detection               |
| `anomaly_reason` | TEXT             | Human-readable anomaly description         |
| `created_at`     | TIMESTAMPTZ      | Auto-set timestamp                         |

### `profiles`

| Column         | Type | Description                      |
| -------------- | ---- | -------------------------------- |
| `user_id`      | UUID | References `auth.users`          |
| `display_name` | TEXT | User display name                |
| `avatar_url`   | TEXT | Public URL from Supabase Storage |
| `bio`          | TEXT | Optional bio                     |

______________________________________________________________________

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A [Supabase](https://supabase.com) project
- A Lovable account (for AI gateway + OAuth)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/aegisspace-ai.git
cd aegisspace-ai
npm install   # or: bun install
```

### 2. Environment Variables

Create a `.env` file in the project root. **Never commit this file.**

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

Get these values from: **Supabase Dashboard → Settings → API**

### 3. Run Migrations

Apply the database schema using the Supabase CLI:

```bash
npx supabase db push
```

Or run the SQL files in `supabase/migrations/` manually via the Supabase
SQL editor in order:

1. `20260408200342_*.sql` — creates `profiles` table + auth trigger
1. `20260408201036_*.sql` — creates `telemetry_data` table + realtime
1. `20260411183219_*.sql` — creates `avatars` storage bucket

### 4. Deploy Edge Function

```bash
npx supabase functions deploy analyze-telemetry
```

Set the required secret in your Supabase project:

```bash
npx supabase secrets set LOVABLE_API_KEY=your-lovable-api-key
```

### 5. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

______________________________________________________________________

## Sending Telemetry (ESP32 / n8n)

See `esp32/flare_telemetry.ino` for the complete firmware source.
Flash it to your FLARE module and configure `esp32/secrets.h` (copy from `secrets_template.h`).

POST JSON to the Supabase REST API (or via n8n webhook):

```text
POST https://your-project-id.supabase.co/rest/v1/telemetry_data
apikey: <your-anon-key>
Content-Type: application/json
```

```json
{
  "device_id": "esp32-001",
  "temperature": 28.4,
  "voltage": 3.7,
  "current": 0.45,
  "gyro_x": 0.02,
  "gyro_y": -0.01,
  "gyro_z": 0.00,
  "is_anomaly": false
}
```

The RLS policy `Anyone can insert telemetry data` allows unauthenticated
inserts — suitable for hardware devices that cannot hold a user session.

______________________________________________________________________

## Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run build:dev    # Development build (for staging)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run test         # Run Vitest unit tests
npm run test:watch   # Vitest in watch mode
```

______________________________________________________________________

## Project Structure

```text
src/
├── assets/                  # Static images (hero, feature shots, step diagrams)
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── AIAnalysisPanel.tsx      # AI assessment card
│   │   ├── DeviceConnectivity.tsx   # Connection status panel
│   │   ├── GyroscopeGraph.tsx       # Gyro X/Y/Z multi-line chart
│   │   ├── RocketDigitalTwin.tsx    # Three.js 3D launch vehicle
│   │   ├── TelemetryGraph.tsx       # Individual sensor chart (area + trend)
│   │   └── TelemetryGridSection.tsx # 2×2 chart grid layout
│   ├── landing/             # Marketing page sections
│   │   ├── Hero.tsx / HeroScene.tsx
│   │   ├── Features.tsx / HowItWorks.tsx
│   │   ├── Pricing.tsx / Reviews.tsx / FAQ.tsx
│   │   └── Navbar.tsx / Footer.tsx / ...
│   ├── ui/                  # shadcn/ui primitives (auto-generated)
│   ├── NavLink.tsx
│   ├── PasswordStrength.tsx
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx       # Supabase auth session provider
├── hooks/
│   ├── useTelemetry.ts       # Real-time telemetry fetch + subscription
│   └── useAnomalyNotifications.ts  # Toast + audio alerts for anomalies
├── integrations/
│   ├── supabase/             # Auto-generated client + type definitions
│   └── lovable/              # Lovable OAuth helper
├── pages/
│   ├── Index.tsx             # Landing page
│   ├── Dashboard.tsx         # Main monitoring dashboard
│   ├── Login.tsx / Signup.tsx / ForgotPassword.tsx / ResetPassword.tsx
│   ├── ProfileSettings.tsx
│   ├── TermsOfService.tsx / PrivacyPolicy.tsx
│   └── NotFound.tsx
└── lib/utils.ts              # Tailwind class merge utility

supabase/
├── functions/
│   └── analyze-telemetry/   # Deno edge function → Gemini AI
└── migrations/              # Ordered SQL migration files
```

______________________________________________________________________

## Security Notes

> **⚠️ Rotate keys before deploying to production.**

- `.env` is excluded from version control via `.gitignore`. Never commit
  real credentials.
- The Supabase **anon key** is safe to expose in frontend bundles — it
  is scoped by RLS policies.
- The `LOVABLE_API_KEY` is a server-side secret stored in Supabase Edge
  Function secrets, never shipped to the client.
- RLS is enabled on both `telemetry_data` and `profiles`. Review policies
  before going to production, especially `Anyone can insert telemetry data` —
  consider restricting to a service-role key on your n8n server in production.

______________________________________________________________________

## Testing

```bash
npm run test           # Vitest unit tests (src/test/)
npx playwright test    # E2E tests (playwright.config.ts)
```

______________________________________________________________________

## License

MIT — see [LICENSE](LICENSE) for details.
