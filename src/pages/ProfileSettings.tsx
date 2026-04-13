import { useAuth } from "@/contexts";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Save, Camera, Lock, Bell } from "lucide-react";
import { ParallaxStars } from "@/components";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProfileSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification prefs
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);

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
    // Load notification prefs from localStorage
    const prefs = localStorage.getItem(`notif_prefs_${user.id}`);
    if (prefs) {
      const parsed = JSON.parse(prefs);
      setAnomalyAlerts(parsed.anomalyAlerts ?? true);
      setEmailNotifications(parsed.emailNotifications ?? false);
      setSoundAlerts(parsed.soundAlerts ?? true);
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be under 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(url);

    await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
    toast.success("Avatar updated!");
    setUploading(false);
  };

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

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const saveNotificationPrefs = () => {
    if (!user) return;
    localStorage.setItem(`notif_prefs_${user.id}`, JSON.stringify({
      anomalyAlerts,
      emailNotifications,
      soundAlerts,
    }));
    toast.success("Notification preferences saved!");
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

      <main className="relative z-10 p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-5 h-5 text-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading text-foreground">Profile Settings</h1>
              <p className="text-xs text-muted-foreground">
                {uploading ? "Uploading…" : "Click avatar to change photo"}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground">Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground" placeholder="Your name" />
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

        {/* Password Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-heading text-foreground">Change Password</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground" placeholder="Min 8 characters" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 bg-muted/30 border-border/50 text-foreground" placeholder="Re-enter password" />
            </div>
            <Button onClick={handlePasswordChange} disabled={passwordLoading} variant="outline" className="rounded-full border-border/50">
              <Lock className="w-4 h-4 mr-2" />
              {passwordLoading ? "Updating…" : "Update Password"}
            </Button>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold font-heading text-foreground">Notification Preferences</h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Anomaly Alerts</p>
                <p className="text-xs text-muted-foreground">Get notified when anomalies are detected</p>
              </div>
              <Switch checked={anomalyAlerts} onCheckedChange={setAnomalyAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Sound Alerts</p>
                <p className="text-xs text-muted-foreground">Play a sound for critical anomalies</p>
              </div>
              <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive email summaries of anomaly events</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <Button onClick={saveNotificationPrefs} variant="outline" className="rounded-full border-border/50">
              <Bell className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProfileSettings;
