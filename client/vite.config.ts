import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 5173 },
  // Rapier의 WASM이 미리 번들링되면 깨지는 경우가 있어 제외
  // Phaser와 Rapier(WASM 내장)가 커서 경고 기준을 올려둠
  build: { chunkSizeWarningLimit: 6000 },
  optimizeDeps: { exclude: ["@dimforge/rapier2d-deterministic-compat"] },
});
