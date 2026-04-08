import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Save } from "lucide-react";
import ParallaxStars from "@/components/landing/ParallaxStars";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProfileSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single()
      .then(({ data }) => {
        if (data) {
          setDisplayName(data.display_name || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url || "");
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      display_name: displayName,
      bio,
      avatar_url: avatarUrl,
    }).eq("user_id", user.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <ParallaxStars />
      <header className="relative z-10 glass-strong border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="font-heading font-bold text-foreground text-sm">
              Aegis<span className="gradient-text">Space</span> AI
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{user?.email}</span>
        </div>
      </header>

      <main className="relative z-10 p-4 lg:p-6 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-foreground">Profile Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your account details</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground">Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground" placeholder="Your name" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Avatar URL</Label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground" placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bio</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground min-h-[100px]" placeholder="Tell us about yourself…" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={user?.email || ""} disabled className="mt-1 bg-muted/20 border-border/30 text-muted-foreground" />
            </div>
            <Button onClick={handleSave} disabled={loading} className="gradient-cyan-pink text-primary-foreground rounded-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfileSettings;
