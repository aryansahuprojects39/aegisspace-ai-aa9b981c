# Plan: Fullscreen Digital Twin + CSV Export + Enhanced Telemetry Graphs

## 1. Fullscreen Toggle for 3D Digital Twin

**File: `src/components/dashboard/RocketDigitalTwin.tsx`**

- Add `isFullscreen` prop and internal state toggle
- When fullscreen: render in a fixed overlay (`fixed inset-0 z-50 bg-background`)
  with a close button
- Add an `Expand`/`Minimize2` icon button in the top-right corner
- Maintain all existing touch-action fixes for mobile

**File: `src/pages/Dashboard.tsx`**

- Add fullscreen state, pass toggle handler and button to the Digital Twin
  card header (next to the status badge)

## 2. CSV Export Button

**File: `src/pages/Dashboard.tsx`**

- Add a `Download` icon button in the header bar
- On click: convert current `telemetry` array to CSV (columns: timestamp,
  temperature, voltage, current, gyro_x, gyro_y, gyro_z, is_anomaly,
  anomaly_reason)
- Use `Blob` + `URL.createObjectURL` + hidden `<a>` click to trigger
  download
- File named `aegis-telemetry-{date}.csv`

## 3. Enhanced Telemetry Graphs

Most features are already implemented (glassmorphism cards, anomaly dots,
threshold zones, time range selectors, legend toggles, skeleton loading,
change indicators). The following additions will be made:

### File: `src/components/dashboard/TelemetryGraph.tsx`

- **Predictive trend line**: Add a dashed `Line` component showing 2-3
  projected points based on linear extrapolation of the last 5 data points.
  Render as semi-transparent dotted line extending past the data.
- **Gradient line stroke**: Add a horizontal `linearGradient` for the
  stroke so the left (older) end is dimmer and the right (newer) end is
  brighter.
- **Enhanced tooltip**: Add a short AI insight string based on status
  (e.g., "Within normal operating range" / "Approaching warning threshold"
  / "Critical — check sensor").

### File: `src/components/dashboard/GyroscopeGraph.tsx`

- **Gradient line strokes**: Same fade-tail gradient effect per axis line.
- **Predictive trend**: Dotted projection lines for each visible axis.

### File: `src/hooks/useTelemetry.ts`

- Increase default limit from 30 to 50 to support zoom/range controls
  better.

### File: `src/components/dashboard/TelemetryGridSection.tsx`

- No structural changes needed — already has the 2x2 grid layout.

---

## Technical Details

- Fullscreen uses React portal or simple fixed positioning with `z-50`
- CSV export is purely client-side, no backend changes
- Predictive trend: linear regression on last 5 points, project 2 synthetic
  points (these are clearly marked as projections, not fake data — they
  extend beyond the real dataset as a dotted forecast line)
- Gradient stroke uses SVG `linearGradient` with `x1="0" x2="1"` for
  horizontal fade
- All changes use existing dependencies (recharts, framer-motion,
  lucide-react)
