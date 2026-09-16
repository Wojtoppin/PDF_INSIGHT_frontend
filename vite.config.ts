import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  base: "/PDF_INSIGHT_frontend/",
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  test: {
    environment: "node",
  },
});
