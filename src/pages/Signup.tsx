import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Rocket, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import pslvHero from "@/assets/pslv-hero.jpg";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !privacyAccepted) {
      toast.error("Please accept both Terms & Conditions and Privacy Policy");
      return;
    }
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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* PSLV Background — blurred & darkened */}
      <div className="absolute inset-0">
        <img
          src={pslvHero}
          alt=""
          className="w-full h-full object-cover scale-110 blur-[2px]"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-background/65" />
        {/* Radial glow accents — slightly different tint from Login */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-secondary/12 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-primary/12 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Animated gradient border wrapper */}
        <div className="relative rounded-3xl p-[1px] overflow-hidden">
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "conic-gradient(from 0deg, hsl(185 100% 71% / 0.3), hsl(320 100% 71% / 0.2), hsl(260 60% 27% / 0.3), hsl(185 100% 71% / 0.3))",
              animation: "spin 8s linear infinite",
            }}
          />

          <div className="glass-login rounded-3xl p-8 lg:p-10 relative">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl gradient-cyan-pink flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-heading text-foreground">
                Aegis<span className="gradient-text">Space</span> AI
              </span>
            </div>

            <h1 className="text-2xl font-bold font-heading text-center text-foreground mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground text-center mb-8">Join mission control today</p>

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
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(c) => setTermsAccepted(c === true)}
                    className="mt-0.5 border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms & Conditions</a>
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
                    I agree to the <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
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
