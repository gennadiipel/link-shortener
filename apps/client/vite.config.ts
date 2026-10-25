import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");

  return {
    base: environment.VITE_APP_BASE_PATH ?? "/",
    plugins: [
      tailwindcss(),
      tanstackStart({ spa: { enabled: true } }),
      react(),
    ],
    server: { port: 3000 },
  };
});
