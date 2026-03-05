import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const daemonHost = env.DAEMON_HOST || "127.0.0.1";
  const daemonPort = env.DAEMON_PORT || "19200";
  const daemonTarget = `http://${daemonHost}:${daemonPort}`;

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT || 5174),
      proxy: {
        "/api": { target: daemonTarget, changeOrigin: true },
        "/health": { target: daemonTarget, changeOrigin: true },
      },
    },
  };
});
