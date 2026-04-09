

# Login Background Fix + Signup Page Redesign

## Issue Found
The Login page's PSLV background is invisible because the overlay (`bg-background/75`) is too opaque, combined with `blur-sm` on the image. The background blends entirely into the dark theme.

## Changes

### 1. Fix Login Background Visibility (`src/pages/Login.tsx`)
- Reduce the main overlay from `bg-background/75` to `bg-background/50`
- Reduce the gradient overlay opacity
- Increase the image `scale-110` slightly and reduce `blur-sm` to allow more detail through
- Boost the radial glow accents from `bg-primary/8` to `bg-primary/15` for visible color pops

### 2. Update Signup Page to Match Login Design (`src/pages/Signup.tsx`)
- Replace `ParallaxStars` background with the same PSLV hero image background (with slightly different overlay tint to differentiate)
- Replace `glass-strong` card with `glass-login` card + animated gradient border wrapper (same as Login)
- Match input styling: `bg-muted/20 border-border/30` instead of `bg-muted/30 border-border/50`
- Keep existing form fields (Display Name, Email, Password) and signup logic unchanged

### Files to Modify
- `src/pages/Login.tsx` — reduce overlay opacity, boost glow accents
- `src/pages/Signup.tsx` — replace background and card styling to match Login

