import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: "https://api.coingecko.com/api/v3",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          headers: {
            // Optional: add your key here for local dev if you have one
            "x-cg-demo-api-key": env.COINGECKO_API_KEY || "",
          },
        },
      },
    },
  };
});
