import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import react from "@vitejs/plugin-react";

const isTest = !!process.env.VITEST;

// Electron plugin must not run during Vitest — dynamically import to avoid resolution errors
const electronPlugins = isTest
  ? []
  : await (async () => {
      const { default: electron } = await import("vite-plugin-electron/simple");
      return [
        electron({
          main: { entry: "electron/main.ts" },
          preload: { input: path.join(__dirname, "electron/preload.ts") },
          renderer: {},
        }),
      ];
    })();

export default defineConfig({
  plugins: [tailwindcss(), react(), ...electronPlugins],

  test: {
    globals: false,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/__tests__/**",
        "src/test/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
    },
  },
});
