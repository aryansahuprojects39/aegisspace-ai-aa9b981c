
# AegisSpace AI — Landing Page Build

## Design System
- **Dark space palette**: `#0B0F2F` → `#1A1A40` → `#2D1E6B` backgrounds
- **Accents**: Cyan `#6EF3FF`, Pink `#FF6EC7`
- **Glassmorphism cards** with soft blur, rounded edges, subtle borders
- **Pill-shaped buttons** with gradient fills and hover lift effects
- **Clean sans-serif typography** (Inter or similar)

## 3D Scenes (React Three Fiber)
- **Hero scene**: Floating abstract rocket/satellite with rings, spheres, and cubes orbiting slowly. Mouse-driven perspective tilt (rotateX/rotateY).
- **Background**: Starfield particle system across the page with slow parallax on scroll
- **Floating geometric accents**: Soft-glow spheres and rings between sections

## Parallax System
- 3-layer depth: background stars (slow), mid-layer glow shapes (medium), foreground 3D objects (fast)
- Scroll-driven section speed differences
- Card hover: 3D tilt effect with shadow shift

## Landing Page Sections

### 1. Navbar
- Logo "AegisSpace AI" | Home | Features | Dashboard | Pricing | Contact | Login | Try Free
- Sticky, glass-blur background on scroll

### 2. Hero
- **Left**: "AegisSpace AI" title, tagline about real-time satellite monitoring, two CTA buttons (gradient pill style)
- **Right**: Interactive 3D scene — abstract minimal rocket with orbiting geometric shapes, mouse-reactive parallax

### 3. Features (4 glass cards)
- Real-Time Telemetry, Anomaly Detection, AI Predictions, Mission Control Dashboard
- Each card with icon, title, description, hover tilt effect

### 4. How It Works
- Visual pipeline: ESP32 → n8n → Supabase → AI → Dashboard
- Animated flow lines connecting each step

### 5. Dashboard Preview
- Static screenshot/mockup of the dashboard layout (no fake data)
- "Waiting for ESP32 data…" placeholder shown in preview graphs
- Glass-bordered frame

### 6. Pricing (3 plans)
- Starter ($29/mo), Pro ($79/mo), Enterprise (Custom)
- Dark glass cards, Pro highlighted/elevated
- Feature checklist per plan, CTA buttons

### 7. Footer
- Links, social icons, copyright

## Technical Setup
- Install `@react-three/fiber@^8.18`, `@react-three/drei@^9.122.0`, `three@^0.160`
- Custom Tailwind theme with space color palette
- Framer Motion for scroll animations and parallax
- Update CSS variables to match the dark space design system
