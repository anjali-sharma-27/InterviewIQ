import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  // Always load .env from the client folder, even if the shell cwd differs.
  root: path.resolve(__dirname),
  envDir: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Recharts pulls a large graph; pre-bundle it explicitly to avoid frequent
  // "504 Outdated Optimize Dep" and broken lazy chunks after dep re-scans.
  optimizeDeps: {
    include: ["recharts"],
  },
})
