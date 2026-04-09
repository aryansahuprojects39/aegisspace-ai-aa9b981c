import { useState } from "react";
import { Wifi, WifiOff, Signal, SignalHigh, SignalLow, Router, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeviceConnectivityProps {
  isConnected: boolean;
  dataPoints: number;
}

const DeviceConnectivity = ({ isConnected, dataPoints }: DeviceConnectivityProps) => {
  const [showWifiPanel, setShowWifiPanel] = useState(false);
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!ssid) return;
    setConnecting(true);
    // Simulated connection — in production this would send config to ESP32
    setTimeout(() => {
      setConnecting(false);
      setShowWifiPanel(false);
      setSsid("");
      setPassword("");
    }, 2000);
  };

  const signalStrength = dataPoints > 30 ? "strong" : dataPoints > 10 ? "medium" : "weak";

  return (
    <div className="glass rounded-2xl p-4 card-tilt">
      <div className="flex items-center gap-2 mb-4">
        <Router className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Device Connectivity</span>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-primary" />
            ) : (
              <WifiOff className="w-4 h-4 text-destructive" />
            )}
            <span className="text-xs text-foreground">
              {isConnected ? "ESP32 Online" : "ESP32 Offline"}
            </span>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-primary" : "bg-destructive"} animate-pulse`} />
        </div>

        {/* Signal Strength */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {signalStrength === "strong" ? (
              <SignalHigh className="w-4 h-4 text-primary" />
            ) : signalStrength === "medium" ? (
              <Signal className="w-4 h-4 text-yellow-400" />
            ) : (
              <SignalLow className="w-4 h-4 text-destructive" />
            )}
            <span className="text-xs text-muted-foreground">Signal: {signalStrength}</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{dataPoints} pts</span>
        </div>

        {/* Device Info */}
        <div className="text-[10px] text-muted-foreground space-y-1 border-t border-border pt-2">
          <div className="flex justify-between"><span>Device ID</span><span className="font-mono">esp32-001</span></div>
          <div className="flex justify-between"><span>Protocol</span><span className="font-mono">HTTPS/WSS</span></div>
          <div className="flex justify-between"><span>Firmware</span><span className="font-mono">v2.1.4</span></div>
        </div>

        {/* WiFi Config Button */}
        <button
          onClick={() => setShowWifiPanel(!showWifiPanel)}
          className="w-full text-xs glass rounded-xl px-3 py-2 text-primary hover:bg-muted/40 transition-colors flex items-center justify-center gap-2"
        >
          <Wifi className="w-3 h-3" />
          Configure WiFi
        </button>
      </div>

      {/* WiFi Configuration Panel */}
      <AnimatePresence>
        {showWifiPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="border border-border rounded-xl p-3 space-y-2">
              <input
                type="text"
                placeholder="WiFi SSID"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full text-xs bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleConnect}
                disabled={connecting || !ssid}
                className="w-full text-xs gradient-cyan-pink text-primary-foreground rounded-lg px-3 py-2 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <><RefreshCw className="w-3 h-3 animate-spin" /> Connecting…</>
                ) : (
                  "Connect ESP32"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceConnectivity;
