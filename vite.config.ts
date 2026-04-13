import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  let n8nOrigin = "";
  const explicitHealth = env.VITE_N8N_HEALTHCHECK_URL;
  const webhookUrl = env.VITE_N8N_WEBHOOK_URL;

  try {
    if (explicitHealth) n8nOrigin = new URL(explicitHealth).origin;
    else if (webhookUrl) n8nOrigin = new URL(webhookUrl).origin;
  } catch {
    n8nOrigin = "";
  }

  return {
    server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
      proxy: n8nOrigin
        ? {
            "/__n8n_health": {
              target: n8nOrigin,
              changeOrigin: true,
              rewrite: () => "/",
            },
          }
        : undefined,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
