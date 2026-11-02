import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/systems-quest/" : "/",
  server: {
    port: 5173,
    host: true,
  },
});
