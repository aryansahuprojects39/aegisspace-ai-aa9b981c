

# Landing Page Redesign Plan

Inspired by the AgroVision reference images, adapted to AegisSpace AI's dark space theme with cyan/pink accents.

## Changes Overview

### 1. Hero Section - Full-Width Background Image
- Replace the current split-layout hero with a full-width hero featuring a PSLV launch vehicle background image (sourced from ISRO/public domain via Unsplash or generated)
- Add a dark overlay gradient so text remains readable
- Keep the "AegisSpace AI" branding, tagline, and CTA buttons
- Add a small badge pill ("Real-Time Satellite Monitoring") like the reference's "Sustainable Farming" badge
- Stats row stays at the bottom of the hero

### 2. Trusted Partners / Logos Bar (New)
- Add a scrolling partners bar below the hero (like the reference's "TRUSTED BY LEADING AGRI-TECH PARTNERS")
- Use space/tech partner names with icons: "SpaceLink", "OrbitTech", "SensorCore", "LaunchBase", "TeleSat", "AstroNet"
- Glassmorphism strip with muted text

### 3. About Us Section (New)
- Split layout: left side has two overlapping images (space/rocket themed), right side has "ABOUT US" label, heading "Innovating the Future of Launch Monitoring", and description paragraph
- Matches the reference's asymmetric image + text layout

### 4. Features Section - Card Grid with Images (Redesign)
- Replace flip cards with image-overlay cards matching the reference's "Insights" bento grid style
- Each card has a full background image, gradient overlay at bottom, and title text
- Use a bento-style layout: one tall card on the left, 2x2 grid on the right
- 6 cards total with space-themed images
- Keep the same 4 features + add 2 more insight-style cards

### 5. How It Works - Keep Existing
- Keep the current pipeline hover-card design (already looks good)

### 6. Insights Section (New)
- Bento grid of 6 cards with space/launch-themed titles
- Large featured card on the left, smaller cards in a 2-column grid on the right
- Each card has a background image with gradient overlay and title text at bottom
- Titles like "Real-Time Telemetry in Modern Space Missions", "AI-Powered Anomaly Detection", etc.

### 7. FAQ Section (New)
- Accordion-based FAQ section matching the reference screenshot
- Dark background, glassmorphism accordion items
- "FAQ" label, "Got Questions? We've Got You Covered." heading
- 5 relevant questions about AegisSpace AI

### 8. Pricing & Footer - Keep Existing
- No changes needed

## New Files
- `src/components/landing/Partners.tsx` - Logo bar
- `src/components/landing/AboutUs.tsx` - About section
- `src/components/landing/Insights.tsx` - Insights bento grid
- `src/components/landing/FAQ.tsx` - Accordion FAQ
- `src/assets/pslv-hero.jpg` - Generated PSLV background image for hero

## Modified Files
- `src/pages/Index.tsx` - Add new sections in order
- `src/components/landing/Hero.tsx` - Full-width background image layout
- `src/components/landing/Features.tsx` - Image-overlay bento cards instead of flip cards
- `src/components/landing/Navbar.tsx` - Add "About Us", "Insights", "FAQ" nav links

## Section Order
Home (Hero) → Partners → About Us → Features → How It Works → Insights → FAQ → Pricing → Footer

## Technical Notes
- PSLV background: Use a royalty-free rocket launch image from Unsplash or generate one via AI. ISRO images are typically public domain.
- All new sections use existing glassmorphism utilities, framer-motion animations, and the space color theme
- FAQ uses the existing shadcn Accordion component
- Images for Insights/About will be AI-generated space-themed JPGs matching the dark cyan/pink palette

