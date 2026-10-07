import { defineConfig } from "vite";

export default defineConfig({
  // Windows에서 기본값은 IPv6(::1)에서만 받아서 127.0.0.1로 찾아가는 브라우저가 접속을 거부당한다.
  // IPv4 주소로 고정하고, 실행하면 브라우저를 자동으로 연다.
  server: { port: 5173, host: "127.0.0.1", open: true },
  // Rapier의 WASM이 미리 번들링되면 깨지는 경우가 있어 제외
  // Phaser와 Rapier(WASM 내장)가 커서 경고 기준을 올려둠
  build: { chunkSizeWarningLimit: 6000 },
  optimizeDeps: { exclude: ["@dimforge/rapier2d-deterministic-compat"] },
});
