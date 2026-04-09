

# Landing Page Enhancements Plan

## Summary
Three changes: (1) Replace the "Capabilities" bento-grid Features section with 3D flip cards, (2) Add a Contact Us section with a form before the Footer, (3) Add smooth scroll behavior and scroll-triggered animations throughout.

## 1. Features Section — Flip Cards (Replace "Capabilities")

**Current state**: Bento grid with image-overlay cards, labeled "Capabilities"
**Target**: Rename to "Features", use 3D flip card effect (front shows icon + title, back shows image + description)

- Rewrite `src/components/landing/Features.tsx`:
  - Section label: "FEATURES" instead of "CAPABILITIES"
  - 6 cards in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
  - Each card uses CSS `perspective` + `transform-style: preserve-3d` + `rotateY(180deg)` on hover
  - Front face: glassmorphism card with icon, title, short description
  - Back face: full image with gradient overlay and extended description
  - Framer Motion `whileInView` stagger animations for entrance

## 2. Contact Us Section

- Create `src/components/landing/ContactUs.tsx`:
  - Placed between FAQ and Footer in the page flow
  - Section heading: "Get In Touch" with gradient text
  - Two-column layout: left side has contact info (email, location, social links), right side has a form
  - Form fields: Name, Email, Subject, Message (textarea)
  - Glassmorphism card styling, gradient submit button
  - Client-side validation with toast feedback (no backend needed for now — just show success toast)
  - Framer Motion entrance animations

- Update `src/pages/Index.tsx`: Add `<ContactUs />` between `<Pricing />` and `<Footer />`
- Update `src/components/landing/Navbar.tsx`: Add "Contact" nav link

## 3. Smooth Scroll & Scroll-Triggered Animations

- Add `scroll-behavior: smooth` to `html` in `src/index.css`
- Enhance all landing sections with consistent framer-motion `whileInView` animations:
  - Fade-up for headings and text blocks
  - Staggered entrance for card grids
  - Scale-in for icons and stat numbers
- Most sections already use `whileInView` — ensure consistency and add where missing (Partners, Footer)

## Files to Create
- `src/components/landing/ContactUs.tsx`

## Files to Modify
- `src/components/landing/Features.tsx` — full rewrite to flip cards
- `src/pages/Index.tsx` — add ContactUs import and component
- `src/components/landing/Navbar.tsx` — add Contact nav link
- `src/index.css` — add `scroll-behavior: smooth` to html, add flip-card CSS utilities

