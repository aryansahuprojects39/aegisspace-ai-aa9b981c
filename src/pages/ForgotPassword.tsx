import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import ParallaxStars from "@/components/landing/ParallaxStars";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Check your email for the reset link!");
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <ParallaxStars />
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass rounded-3xl p-8 glow-cyan">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
          <h1 className="text-2xl font-bold font-heading text-foreground mb-2">Reset Password</h1>
          <p className="text-sm text-muted-foreground mb-6">Enter your email to receive a password reset link.</p>

          {sent ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-sm text-foreground">Reset link sent to <strong>{email}</strong></p>
              <p className="text-xs text-muted-foreground mt-2">Check your inbox and spam folder.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="mt-1 bg-muted/30 border-border/50 text-foreground" placeholder="you@example.com" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-cyan-pink text-primary-foreground rounded-full">
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
