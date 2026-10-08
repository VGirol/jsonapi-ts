import * as path from "node:path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json" with { type: "json" };

const externals = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})];

// https://vitejs.dev/config/
export default defineConfig({
  // A single index.d.ts: split declarations use extensionless relative imports, which "nodenext" consumers cannot resolve
  plugins: [dts({ rollupTypes: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/index.ts"),
      name: "jsonapi-ts",
      fileName: "index",
      formats: ["es"] // pure ESM package
    },
    rollupOptions: {
      // Dependencies and peer dependencies are installed by the consumer: never bundle them
      external: (id) => externals.some((name) => id === name || id.startsWith(name + "/"))
    },
    target: "esnext"
  }
});
