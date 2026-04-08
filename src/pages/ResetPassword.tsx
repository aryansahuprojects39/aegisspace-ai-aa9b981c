import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import ParallaxStars from "@/components/landing/ParallaxStars";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sets session from the URL hash automatically
  }, []);

  const checks = useMemo(() => [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const strength = checks.filter(c => c.pass).length;
  const strengthLabel = strength <= 2 ? "Weak" : strength <= 3 ? "Fair" : strength <= 4 ? "Good" : "Strong";
  const strengthColor = strength <= 2 ? "bg-destructive" : strength <= 3 ? "bg-yellow-500" : strength <= 4 ? "bg-primary/70" : "bg-primary";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    if (strength < 3) { toast.error("Password too weak"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); } else {
      toast.success("Password updated!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <ParallaxStars />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass rounded-3xl p-8 glow-cyan">
          <h1 className="text-2xl font-bold font-heading text-foreground mb-2">Set New Password</h1>
          <p className="text-sm text-muted-foreground mb-6">Choose a strong password for your account.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-xs text-muted-foreground">New Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground" required />
            </div>
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < strength ? strengthColor : "bg-muted"}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{strengthLabel}</span>
                <div className="grid grid-cols-2 gap-1">
                  {checks.map(c => (
                    <div key={c.label} className="flex items-center gap-1 text-xs">
                      {c.pass ? <Check className="w-3 h-3 text-primary" /> : <X className="w-3 h-3 text-muted-foreground/50" />}
                      <span className={c.pass ? "text-foreground" : "text-muted-foreground/50"}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="confirm" className="text-xs text-muted-foreground">Confirm Password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-cyan-pink text-primary-foreground rounded-full">
              {loading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
