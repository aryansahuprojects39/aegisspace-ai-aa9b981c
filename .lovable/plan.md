

# Landing Page Enhancements Plan

## Summary
Rename "ESP32" to "FLARE Module" everywhere, add a Reviews section, optimize pipeline images, update Pricing with monthly/yearly toggle, first-login discount, and 7-day free trial badge.

## 1. Rename ESP32 → FLARE Module

Replace all references to "ESP32" with "FLARE Module" (or "FLARE" where space is tight) across these files:
- `Hero.tsx` — description text
- `AboutUs.tsx` — description paragraphs
- `Features.tsx` — shortDesc, longDesc, and section subtitle
- `HowItWorks.tsx` — step label, import alias rename
- `FAQ.tsx` — answers mentioning ESP32
- `DashboardPreview.tsx` — status labels
- `Dashboard.tsx` — status labels and waiting messages
- `Pricing.tsx` — feature list items ("1 ESP32 Device" → "1 FLARE Module", etc.)

## 2. Reviews Section (New)

Create `src/components/landing/Reviews.tsx`:
- Section heading: "What Our Clients Say" with gradient text
- 3-4 review cards from fictional small startups/companies:
  - Company name, reviewer name + role, star rating, quote
  - Example: "OrbitMinds — CTO — 'AegisSpace AI cut our anomaly response time by 80%'"
  - "NovaSat Labs — Lead Engineer — 'The FLARE module integration was seamless'"
  - "Stellar Dynamics — Founder — 'Best monitoring platform for small sat missions'"
  - "RocketBay — Mission Director — 'Real-time telemetry changed how we operate'"
- Glassmorphism cards with star icons, avatar placeholder initials
- Framer Motion stagger animations
- Place between Insights and FAQ in `Index.tsx`
- Add "Reviews" nav link in `Navbar.tsx`

## 3. Pipeline Images — Faster Loading

In `HowItWorks.tsx`:
- Add `loading="eager"` and explicit `width`/`height` to pipeline step images
- Add `fetchpriority="high"` for the first 2-3 images
- Use smaller dimensions in the `img` tag (already has `w-full h-36`)

## 4. Pricing — Monthly/Yearly Toggle + Discount + Free Trial

Rewrite `src/components/landing/Pricing.tsx`:
- Add a Monthly/Yearly toggle at the top using a pill-style toggle group
- Monthly prices: Starter $29, Pro $79, Enterprise Custom
- Yearly prices: Starter $24 (~17% off), Pro $66 (~17% off), Enterprise Custom
- Show "Save 17%" badge next to the yearly toggle
- Add a banner/badge: "🎉 20% off your first month — auto-applied at checkout"
- Add "7-Day Free Trial" badge on Starter and Pro cards
- Show original price crossed out with discounted first-month price
- Keep existing glassmorphism card styling and animations

## 5. Integration

Update `Index.tsx`: Add `<Reviews />` between `<Insights />` and `<FAQ />`
Update `Navbar.tsx`: Add "Reviews" nav link

## Files to Create
- `src/components/landing/Reviews.tsx`

## Files to Modify
- `src/components/landing/Hero.tsx`
- `src/components/landing/AboutUs.tsx`
- `src/components/landing/Features.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/FAQ.tsx`
- `src/components/landing/DashboardPreview.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/landing/Pricing.tsx`
- `src/pages/Index.tsx`
- `src/components/landing/Navbar.tsx`

