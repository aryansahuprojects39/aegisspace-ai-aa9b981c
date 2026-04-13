import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { PasswordStrength } from "@/components";
import pslvHero from "@/assets/pslv-hero.jpg";
import logo from "@/assets/aegisspace-logo.png";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const validateTerms = () => {
    if (!termsAccepted || !privacyAccepted) {
      toast.error("Please accept both Terms & Conditions and Privacy Policy");
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateTerms()) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Account created! Signing you in…");
      navigate("/dashboard");
    }
  };

  const handleGoogleSignup = async () => {
    if (!validateTerms()) return;
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message || "Google sign-in failed");
      toast.error("If this persists, enable Google provider and add this redirect URL in Supabase Auth settings.");
      setGoogleLoading(false);
      return;
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={pslvHero} alt="" className="w-full h-full object-cover scale-110 blur-[2px]" />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-background/65" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-secondary/12 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-primary/12 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="relative rounded-3xl p-[1px] overflow-hidden">
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "conic-gradient(from 0deg, hsl(185 100% 71% / 0.3), hsl(320 100% 71% / 0.2), hsl(260 60% 27% / 0.3), hsl(185 100% 71% / 0.3))",
              animation: "spin 8s linear infinite",
            }}
          />

          <div className="glass-login rounded-3xl p-8 lg:p-10 relative">
            <div className="flex items-center justify-center gap-2 mb-8">
              <img src={logo} alt="AegisSpace AI" className="w-10 h-10 rounded-xl object-contain" />
              <span className="text-xl font-bold font-heading text-foreground">
                Aegis<span className="gradient-text">Space</span> AI
              </span>
            </div>

            <h1 className="text-2xl font-bold font-heading text-center text-foreground mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground text-center mb-6">Join mission control today</p>

            {/* T&C Checkboxes — required before any sign-up method */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(c === true)}
                  className="mt-0.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                </label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox
                  id="privacy"
                  checked={privacyAccepted}
                  onCheckedChange={(c) => setPrivacyAccepted(c === true)}
                  className="mt-0.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label htmlFor="privacy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I agree to the <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </label>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border/40 bg-muted/15 text-foreground text-sm font-medium hover:bg-muted/30 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? "Signing up…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border/30" />
              <span className="text-xs text-muted-foreground">or continue with email</span>
              <div className="flex-1 h-px bg-border/30" />
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Display Name</label>
                <Input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Commander"
                  className="bg-muted/20 border-border/30 rounded-xl h-11 text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@aegisspace.ai"
                  className="bg-muted/20 border-border/30 rounded-xl h-11 text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="bg-muted/20 border-border/30 rounded-xl h-11 text-foreground pr-10 focus:border-primary/50"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-pill gradient-cyan-pink text-primary-foreground text-sm w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Creating account…" : "Create Account"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
