

# Terms/Privacy Pages + Real-Time Telemetry Graph System

## Part 1: Terms of Service & Privacy Policy Pages

### New files
- `src/pages/TermsOfService.tsx` — Full Terms of Service page with AegisSpace AI branding, dark theme, scroll-friendly layout
- `src/pages/PrivacyPolicy.tsx` — Full Privacy Policy page with matching style

### Modified files
- `src/App.tsx` — Add routes `/terms` and `/privacy`
- `src/components/landing/Footer.tsx` — Update "Privacy Policy" and "Terms of Service" links from `#` to `/privacy` and `/terms` using `<Link>` from react-router-dom
- `src/pages/Login.tsx` and `src/pages/Signup.tsx` — Update T&C checkbox links to route to `/terms` and `/privacy`

---

## Part 2: Real-Time Telemetry Graph System

### Approach
Replace the existing small chart cards in the dashboard with a redesigned telemetry graph system that matches the requested spec. Uses the existing `useTelemetry` hook (real ESP32 data via Supabase Realtime) — no fake data.

### New file: `src/components/dashboard/TelemetryGraph.tsx`
A reusable graph card component with:
- **Glassmorphism card**: `backdrop-blur-xl`, semi-transparent `bg-card/40`, `border border-white/5`, rounded-2xl, soft shadow, subtle border glow via `box-shadow` with graph color
- **Header**: Title (top-left) + live value (top-right) with color-coded badge
- **Graph**: Recharts `AreaChart` with `monotone` curve type, gradient fill, smooth stroke
- **Colors**: Temperature `#FF6B6B`, Voltage `#6EF3FF`, Current `#FFD93D`, Gyroscope `#A66CFF`
- **Empty state**: Skeleton shimmer + "Waiting for ESP32 data…" text
- **Tooltip**: Shows value, timestamp, and normal range on hover
- **Anomaly markers**: Red dots on anomaly data points, card border glows red when latest point is anomaly
- **Animation**: `animationDuration={500}` on Line/Area, `isAnimationActive={true}`

### New file: `src/components/dashboard/GyroscopeGraph.tsx`
Combined X/Y/Z graph using three `Line` components (cyan, pink, purple) inside one card. Same glassmorphism styling.

### New file: `src/components/dashboard/TelemetryGridSection.tsx`
Wraps all four graphs in a 2x2 grid layout:
```text
[ Temperature ]   [ Voltage    ]
[ Current     ]   [ Gyroscope  ]
```
Grid: `grid-cols-1 md:grid-cols-2 gap-4`

### Modified file: `src/pages/Dashboard.tsx`
- Remove the inline `TelemetryChart` component and the 4-column chart row
- Import and render `TelemetryGridSection` in its place, passing `telemetry` data (last 30 points)
- Keep all other dashboard sections (Digital Twin, AI Panel, Data Stream, etc.) unchanged

### Data handling
- Uses existing `useTelemetry(30)` hook — limits to 30 data points
- Real-time subscription already in place via `postgres_changes` on `telemetry_data`
- New points append and old ones shift out (sliding window) — already implemented in the hook
- No changes needed to the hook

### Performance
- Fixed 30-point dataset prevents lag
- `dot={false}` on lines except anomaly custom dots
- `isAnimationActive` with short duration for smooth transitions
- No full re-renders — React state append pattern already optimized

### Anomaly visualization
- Custom dot renderer: if `is_anomaly === true` on a data point, render a red glowing circle marker
- Card gets a red border glow (`shadow-[0_0_20px_rgba(255,0,0,0.3)]`) when latest data is anomaly
- Graph line segments on anomaly points rendered in red via custom `activeDot`

### Loading experience
- Skeleton loaders (using existing `Skeleton` component) shown while `loading` is true from `useTelemetry`
- Smooth fade transition from skeleton to live graph via framer-motion `AnimatePresence`

