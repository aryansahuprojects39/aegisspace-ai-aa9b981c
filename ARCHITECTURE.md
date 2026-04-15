# AegisSpace AI - Architecture & Code Analysis

**Generated:** April 12, 2026\
**Total Source Files:** 97 TypeScript/TSX files\
**Project Type:** Full-stack React + Supabase application

______________________________________________________________________

## System Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                     AegisSpace AI Platform                      │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │   ESP32 FLARE    │
    │  Hardware Module │
    │  (Sensor Data)   │
    └────────┬─────────┘
             │ HTTP POST
             ▼
    ┌──────────────────┐
    │   n8n Webhook    │
    │  (Validation)    │
    └────────┬─────────┘
             │ REST API
             ▼
    ┌─────────────────────────┐
    │  Supabase Postgres DB   │
    │  - telemetry_data table │
    │  - profiles table       │
    └──────┬──────────┬───────┘
           │          │
      Realtime    Edge Function
           │          │
           ▼          ▼
    ┌─────────────────────────┐
    │  Supabase Edge Function │
    │  (Deno Runtime)         │
    │  → Google Gemini API    │
    └──────┬──────────────────┘
           │ WebSocket
           ▼
┌─────────────────────────────────────────┐
│      React Frontend (Vite)             │
│  ┌──────────────────────────────────┐ │
│  │  Dashboard Component             │ │
│  │  ├─ TelemetryGraph               │ │
│  │  ├─ GyroscopeGraph               │ │
│  │  ├─ AIAnalysisPanel              │ │
│  │  └─ DeviceConnectivity           │ │
│  │                                  │ │
│  │  Landing Page                    │ │
│  │  ├─ Features                     │ │
│  │  ├─ Pricing                      │ │
│  │  ├─ FAQ                          │ │
│  │  └─ Contact                      │ │
│  │                                  │ │
│  │  Auth Pages                      │ │
│  │  ├─ Login/Signup                 │ │
│  │  ├─ ForgotPassword               │ │
│  │  └─ ProfileSettings              │ │
│  └──────────────────────────────────┘ │
│                                        │
│  State Management:                     │
│  ├─ React Context (Auth)               │
│  ├─ React Query (Server State)         │
│  └─ useState/useReducer (Local UI)     │
└────────────────────────────────────────┘
```

______________________________________________________________________

## Component Architecture

### Directory Structure

```text
src/
├── components/
│   ├── dashboard/              [7 files] - Real-time monitoring
│   │   ├── AIAnalysisPanel.tsx           - Gemini AI insights
│   │   ├── DeviceConnectivity.tsx        - Hardware status
│   │   ├── GyroscopeGraph.tsx            - 3D rotation data
│   │   ├── RocketDigitalTwin.tsx         - Interactive 3D model
│   │   ├── TelemetryGraph.tsx            - Sensor charts
│   │   ├── TelemetryGridSection.tsx      - Layout grid
│   │   └── index.ts
│   │
│   ├── landing/               [12 files] - Marketing pages
│   │   ├── AboutUs.tsx                   - Company info
│   │   ├── ContactUs.tsx                 - Contact form
│   │   ├── DashboardPreview.tsx          - Feature showcase
│   │   ├── FAQ.tsx                       - FAQ section
│   │   ├── Features.tsx                  - Key features
│   │   ├── Footer.tsx                    - Footer
│   │   ├── Hero.tsx                      - Main hero
│   │   ├── HeroScene.tsx                 - 3D background
│   │   ├── HowItWorks.tsx                - Process steps
│   │   ├── Insights.tsx                  - Metrics/stats
│   │   ├── Navbar.tsx                    - Navigation
│   │   ├── ParallaxStars.tsx             - Animated BG
│   │   ├── Partners.tsx                  - Partner logos
│   │   ├── Pricing.tsx                   - Pricing table
│   │   ├── Reviews.tsx                   - Testimonials
│   │   └── index.ts
│   │
│   ├── ui/                    [25 files] - shadcn/ui components
│   │   └── [Auto-generated from shadcn]
│   │
│   ├── NavLink.tsx                       - Custom link component
│   ├── PasswordStrength.tsx              - Password validator UI
│   ├── ProtectedRoute.tsx                - Auth guard HOC
│   └── index.ts
│
├── pages/                      [8 pages]
│   ├── Index.tsx                         - Landing page
│   ├── Dashboard.tsx                     - Main app
│   ├── Login.tsx                         - Auth
│   ├── Signup.tsx                        - Registration
│   ├── ForgotPassword.tsx                - Password recovery
│   ├── ResetPassword.tsx                 - Password reset
│   ├── ProfileSettings.tsx               - User profile
│   ├── TermsOfService.tsx                - Legal
│   ├── PrivacyPolicy.tsx                 - Legal
│   └── NotFound.tsx                      - 404 page
│
├── hooks/                      [2 hooks]
│   ├── useTelemetry.ts                   - Real-time subscription
│   ├── useAnomalyNotifications.ts        - Alert system
│   └── index.ts
│
├── contexts/                   [1 context]
│   ├── AuthContext.tsx                   - Global auth state
│   └── index.ts
│
├── integrations/
│   ├── supabase/                         - Supabase client
│   │   ├── client.ts                     - Init + types
│   │   └── index.ts
│   ├── lovable/                          - OAuth integration
│   └── index.ts
│
├── lib/
│   ├── utils.ts                          - Tailwind merge utility
│   └── index.ts
│
├── assets/
│   └── [Images: hero, feature, step diagrams]
│
├── App.tsx                               - Root component + routing
├── index.css                             - Global styles + animations
└── main.tsx                              - Entry point
```

### Component Dependency Graph

```text
App.tsx (Root)
├── AuthContext (Provider)
│   └── Router (React Router v6)
│       ├── Landing Page
│       │   ├── Navbar
│       │   ├── Hero + HeroScene
│       │   ├── Features
│       │   ├── HowItWorks
│       │   ├── Pricing
│       │   ├── FAQ
│       │   ├── Reviews
│       │   ├── Insights
│       │   ├── Partners
│       │   └── Footer
│       │
│       └── Dashboard (Protected Route)
│           ├── useAuth (from Context)
│           ├── useTelemetry (Realtime hook)
│           ├── useAnomalyNotifications
│           │
│           └── Component Grid
│               ├── TelemetryGridSection
│               │   ├── TelemetryGraph (multiple instances)
│               │   └── GyroscopeGraph
│               │
│               ├── RocketDigitalTwin (3D)
│               │
│               ├── AIAnalysisPanel
│               │   └── Fetches from Edge Function
│               │
│               └── DeviceConnectivity
│
└── Auth Pages (Protected Routes)
    ├── Login
    ├── Signup
    ├── ForgotPassword
    ├── ResetPassword
    └── ProfileSettings
```

______________________________________________________________________

## Data Flow

### Real-Time Telemetry Flow

```text
1. ESP32 Hardware
   └─ POST /rest/v1/telemetry_data (via n8n)

2. Supabase Postgres
   └─ INSERT into telemetry_data table
   └─ Trigger: RLS policy checks, auto-timestamp

3. Supabase Realtime (WebSocket)
   └─ Broadcast: New row inserted

4. useTelemetry Hook
   ├─ useTelemetry.subscribe('telemetry_data')
   ├─ onInsert: Fetch latest 50 rows
   ├─ onUpdate: Real-time field sync
   └─ Return: telemetry[], loading, error

5. TelemetryGraph Component
   ├─ Receives telemetry data via props
   ├─ useEffect: Re-render on new data
   ├─ Recharts: Update line chart
   ├─ Show anomaly markers
   └─ Animate new points

6. useAnomalyNotifications Hook
   ├─ Watch: is_anomaly flag
   ├─ On True: Toast notification + Audio alert
   └─ Context: Anomaly data for AIAnalysisPanel
```

### AI Analysis Flow

```text
1. User clicks "Analyze Mission"

2. Dashboard.tsx
   ├─ Collect current telemetry state
   ├─ POST /functions/v1/analyze-telemetry
   └─ Pass: telemetry[], device_id, time_range

3. Supabase Edge Function (Deno)
   ├─ Receive request
   ├─ Format data as AI prompt
   ├─ POST to Google Gemini API
   │   └─ Via Lovable AI Gateway
   └─ Return: AI response

4. AIAnalysisPanel
   ├─ Receive response
   ├─ Parse: status, risks, recommendations
   ├─ Render: Formatted analysis card
   └─ Show: Alerts + action items
```

### Authentication Flow

```text
1. User clicks "Sign Up with Google"

2. Lovable OAuth Handler
   ├─ Redirect to Google
   ├─ User authorizes
   └─ Return: OAuth token

3. Supabase Auth
   ├─ Exchange token for session
   ├─ Store: JWT in browser localStorage
   └─ Set: auth.currentUser

4. AuthContext
   └─ Broadcast: useAuth hook to all components

5. Protected Routes
   ├─ Check: useAuth().user
   ├─ If null: Redirect to login
   └─ If user: Render component

6. Profile Page
   ├─ Fetch: profiles table row (user_id)
   ├─ Show: display_name, bio, avatar_url
   ├─ Allow: Edit profile, upload avatar to Supabase Storage
   └─ Save: UPDATE profiles table
```

______________________________________________________________________

## Database Schema

### telemetry_data Table

```text
CREATE TABLE public.telemetry_data (
    id UUID PRIMARY KEY (auto-generated),
    device_id TEXT DEFAULT 'esp32-001',
    temperature FLOAT8,
    voltage FLOAT8,
    current FLOAT8,
    gyro_x FLOAT8,     -- Rotation around X axis (°/s)
    gyro_y FLOAT8,     -- Rotation around Y axis (°/s)
    gyro_z FLOAT8,     -- Rotation around Z axis (°/s)
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_reason TEXT,
    created_at TIMESTAMPTZ (auto-set),

    -- Indexes for performance
    PRIMARY KEY: id
    INDEX: created_at (for time range queries)
    INDEX: device_id (for device filtering)

    -- RLS Policy (Anyone can insert via API key)
    Policy: "Anyone can insert telemetry"
        INSERT: public
    Policy: "Users can view all telemetry"
        SELECT: public
);
```

### profiles Table

```text
CREATE TABLE public.profiles (
    user_id UUID PRIMARY KEY (from auth.users),
    display_name TEXT,
    avatar_url TEXT,           -- URL to Supabase Storage
    bio TEXT,
    created_at TIMESTAMPTZ (auto-set),
    updated_at TIMESTAMPTZ (auto-set),

    -- Foreign key
    FOREIGN KEY: user_id → auth.users.id

    -- RLS Policy
    Policy: "Users can view/update own profile"
        SELECT/UPDATE: WHERE user_id = auth.uid()
);
```

### avatars Storage Bucket

```text
Supabase Storage: avatars/
├─ {user_id}/avatar.jpg          -- User uploads here
└─ Public: RLS policy allows authenticated access
```

______________________________________________________________________

## Key Technologies & Patterns

### React & State Management

| Pattern                     | Usage                       | Where                |
| --------------------------- | --------------------------- | -------------------- |
| `useState`                  | Local component state       | Every component      |
| `useEffect`                 | Side effects, subscriptions | Hooks, pages         |
| `useContext` + `useReducer` | Global auth state           | AuthContext.tsx      |
| `React Query`               | Server state caching        | Potential future use |
| `React Router v6`           | Client-side routing         | App.tsx              |
| `React Hook Form + Zod`     | Form validation             | Login, Signup pages  |

### Styling Approach

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Utility CSS | Tailwind CSS (95%+ of styles)       |
| Components  | shadcn/ui (pre-built, unstyled)     |
| Animations  | Framer Motion (transitions)         |
| Pattern     | Glassmorphism (frosted glass cards) |
| Responsive  | Mobile-first, `sm:` breakpoints     |

### 3D Graphics Stack

| Component         | Library           | Purpose                    |
| ----------------- | ----------------- | -------------------------- |
| Scene setup       | Three.js          | 3D rendering engine        |
| React integration | React Three Fiber | Declarative 3D             |
| Helpers           | Drei              | Models, animations, lights |
| Rotation          | Quaternion math   | Gyro → 3D rotation         |

### Data Visualization

| Chart                   | Library  | Real-time                |
| ----------------------- | -------- | ------------------------ |
| Line charts (telemetry) | Recharts | Yes (re-renders on data) |
| Multi-line (gyro)       | Recharts | Yes                      |
| Dashboard grid          | CSS Grid | Yes                      |

### Backend & Database

| Layer        | Technology              | Purpose                 |
| ------------ | ----------------------- | ----------------------- |
| Database     | PostgreSQL (Supabase)   | Persistent storage      |
| Real-time    | Supabase Realtime       | WebSocket subscriptions |
| Auth         | Supabase Auth + Lovable | OAuth + JWT sessions    |
| Serverless   | Deno Edge Functions     | AI analysis endpoint    |
| File storage | Supabase Storage        | Avatar uploads          |

______________________________________________________________________

## Performance Optimizations

### Frontend Performance

1. **Code Splitting** - Vite automatically chunks by route
1. **Component Memoization** - `React.memo()` on expensive charts
1. **Lazy Loading** - Landing page images load on scroll
1. **Realtime Throttling** - Debounce chart re-renders
1. **CSS-in-JS Avoidance** - Pure Tailwind reduces runtime overhead

### Database Performance

1. **Indexing** - `created_at`, `device_id` indexed for queries
1. **Pagination** - useTelemetry fetches 50 rows per subscription
1. **Connection Pooling** - Supabase handles automatically
1. **RLS Optimization** - Policies evaluated at connection time

### 3D Performance

1. **Geometry Reuse** - Single rocket model instance
1. **Frustum Culling** - Three.js automatic
1. **LOD (Level of Detail)** - Could add for large models
1. **Render Batching** - Drei handles automatically

______________________________________________________________________

## Security Implementation

### Frontend Security

| Layer            | Implementation                   |
| ---------------- | -------------------------------- |
| XSS Prevention   | React auto-escapes JSX           |
| CSRF             | Supabase handles tokens          |
| Secrets          | `.env` excluded from git         |
| Auth             | Protected routes + context check |
| Input Validation | Zod schemas on forms             |

### Backend Security

| Layer               | Implementation                      |
| ------------------- | ----------------------------------- |
| RLS Policies        | Enable table-level access control   |
| API Key Scoping     | Supabase anon key restricted by RLS |
| Service Role Secret | Only in Edge Functions              |
| CORS                | Supabase auto-configured            |
| Rate Limiting       | Supabase built-in                   |

______________________________________________________________________

## Build & Deployment

### Development

```bash
npm run dev          # Vite dev server (http://localhost:8080)
                     # HMR enabled for instant updates
```

### Production Build

```bash
npm run build        # Vite build → dist/
                     # Tree-shaking, minification, code splitting
npm run preview      # Local preview of production build
```

### Testing

```bash
npm run test         # Vitest unit tests (src/**/*.test.ts)
npx playwright test  # E2E tests (playwright.config.ts)
npm run lint         # ESLint + TypeScript
```

### Deployment Targets

| Target       | Method                  | Ideal For   |
| ------------ | ----------------------- | ----------- |
| Vercel       | Git push → auto-deploy  | Production  |
| Netlify      | Git push → auto-deploy  | Production  |
| Docker       | Containerize → registry | Production  |
| GitHub Pages | Static export           | Static only |

______________________________________________________________________

## Key Files Reference

| File                            | Purpose                | Lines |
| ------------------------------- | ---------------------- | ----- |
| `package.json`                  | Dependencies & scripts | 96    |
| `vite.config.ts`                | Build configuration    | 22    |
| `tsconfig.json`                 | TypeScript settings    | 15    |
| `eslint.config.js`              | Code quality rules     | 26    |
| `tailwind.config.ts`            | Styling config         | 60+   |
| `src/App.tsx`                   | Root component         | ~50   |
| `src/contexts/AuthContext.tsx`  | Global auth            | ~80   |
| `src/hooks/useTelemetry.ts`     | Real-time hook         | ~150  |
| `src/charts/TelemetryGraph.tsx` | Main chart             | ~200  |

______________________________________________________________________

## Common Development Tasks

### Adding a New Page

1. Create file: `src/pages/NewPage.tsx`
1. Export component from `src/pages/index.ts`
1. Add route in `src/App.tsx`:

```tsx
<Route path="/new-page" element={<NewPage />} />
```

1. Add link in `Navbar.tsx`:

```tsx
<NavLink to="/new-page">New Page</NavLink>
```

### Adding a New Chart

1. Create: `src/components/dashboard/NewChart.tsx`
1. Extend `TelemetryGraph.tsx` pattern
1. Use Recharts for charts, Framer Motion for animations
1. Add to `TelemetryGridSection.tsx`

### Deploying Edge Function

```bash
npx supabase functions deploy analyze-telemetry
npx supabase secrets set LOVABLE_API_KEY=...
```

### Running Tests

```bash
npm run test:watch   # Watch mode for development
npm run test         # Single run
npx playwright test  # E2E only
```

______________________________________________________________________

## Next Steps & Roadmap

- [ ] Add more sensor types (pressure, humidity, etc.)
- [ ] Implement data export (CSV, JSON)
- [ ] Add historical trend analysis
- [ ] Multi-device support
- [ ] Custom alerts & thresholds
- [ ] Mobile app (React Native)
- [ ] Advanced 3D visualization
- [ ] ML-powered anomaly detection

______________________________________________________________________

**Document Version:** 1.0\
**Last Generated:** April 12, 2026\
**Generator:** Manual code analysis + architecture review

______________________________________________________________________

## ESP32 FLARE Module

### File: `esp32/flare_telemetry.ino`

```text
esp32/
├── flare_telemetry.ino     # Main firmware (Arduino IDE)
├── secrets_template.h      # Credential template (copy → secrets.h)
└── README.md               # Wiring, library deps, LED codes
```

### Sensor Stack

| Sensor         | Library                      | Output                   |
| -------------- | ---------------------------- | ------------------------ |
| MPU6050        | Adafruit MPU6050             | gyro_x/y/z (°/s)         |
| INA219         | Adafruit INA219              | voltage (V), current (A) |
| ESP32 internal | built-in `temperatureRead()` | temperature (°C)         |

### Anomaly Detection (on-device)

Anomalies are flagged on the ESP32 before posting — no round-trip to the server required for detection.
The `is_anomaly` and `anomaly_reason` fields are set in firmware and stored verbatim in Postgres.

### POST Payload

```json
{
  "device_id": "esp32-001",
  "temperature": 28.45,
  "voltage": 3.700,
  "current": 0.4500,
  "gyro_x": 0.0200,
  "gyro_y": -0.0100,
  "gyro_z": 0.0000,
  "is_anomaly": false
}
```

______________________________________________________________________

## Migration History

| File                   | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `20260408200342_*.sql` | `profiles` table + auth trigger                       |
| `20260408201036_*.sql` | `telemetry_data` table + realtime + device index      |
| `20260411183219_*.sql` | `avatars` storage bucket + RLS policies               |
| `20260412000000_*.sql` | Anomaly index + time index + RLS device-id validation |
