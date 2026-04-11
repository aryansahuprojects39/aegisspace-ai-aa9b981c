

# Login/Signup Enhancements Plan

## 1. Add Logo Image as Reference-Inspired SVG Logo
- Copy the uploaded logo to `src/assets/aegisspace-logo.png`
- Replace the Rocket icon + gradient box in Login, Signup, and Navbar with an `<img>` tag using the logo
- Size: ~40px in auth pages, ~36px in navbar

## 2. Google Authentication
- Use the Configure Social Auth tool to generate the `src/integrations/lovable` module
- Add a "Continue with Google" button on both Login and Signup pages using `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Style: outline button with Google icon, separator ("or continue with email"), placed above the email form

## 3. Password Strength Checker (Signup only)
- Add a `PasswordStrengthIndicator` component (`src/components/PasswordStrength.tsx`)
- Checks: length >= 8, uppercase, lowercase, number, special char
- Visual: 4-segment bar (red/orange/yellow/green) + label (Weak/Fair/Good/Strong)
- Renders below the password input on the Signup page

## 4. Skeleton Loading Pages
- Replace the spinner in `ProtectedRoute.tsx` with a skeleton layout resembling the Dashboard (header bar, sidebar placeholders, content grid)
- Use the existing `Skeleton` component from shadcn

## Files to Create
- `src/components/PasswordStrength.tsx`
- `src/assets/aegisspace-logo.png` (copy from upload)

## Files to Modify
- `src/pages/Login.tsx` — add Google button, logo image, divider
- `src/pages/Signup.tsx` — add Google button, logo image, password strength indicator, divider
- `src/components/ProtectedRoute.tsx` — replace spinner with skeleton layout
- `src/components/landing/Navbar.tsx` — use logo image

