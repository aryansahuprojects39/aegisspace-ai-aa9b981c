

# Login Page Enhancement Plan

## Verification Results
All landing page sections render correctly:
- Hero with PSLV background and "Real-Time Satellite Monitoring" pill
- Reviews section with 4 glassmorphism cards, star ratings, FLARE branding
- Pricing with Monthly/Yearly toggle, "Save 17%" badge, 20% discount banner, 7-Day Free Trial badges
- FLARE module branding consistent throughout
- Contact Us form and Footer intact

## Login Page Changes

### File: `src/pages/Login.tsx`

1. **Add PSLV background image** — reuse the same `pslv-hero.jpg` from the landing page hero but with a different gradient overlay (more centered/blurred) so it feels distinct
2. **Enhanced glossy glass card** — upgrade the login card with:
   - Stronger glassmorphism: higher backdrop-blur (40px), more transparent background with a subtle gradient border
   - Animated gradient border using a CSS pseudo-element or inline style
   - Inner glow/shadow for depth
   - Subtle animated gradient ring around the card edges
3. **Background treatment** — darken and blur the PSLV image more than the landing page, add radial gradient overlays for a unique look compared to the hero

### File: `src/index.css`
- Add a `.glass-login` utility class with enhanced blur, gradient border, and inner glow effects

### Visual Differences from Landing Page
- Landing hero: PSLV visible clearly, gradient from left
- Login page: PSLV more subdued/blurred, centered radial glow accents, focus on the glossy card

