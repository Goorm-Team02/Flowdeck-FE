// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- [수정] 백엔드의 엄격한 CORS 검문소를 완벽히 패스하는 프록시 세부 설정 ---
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://54.180.241.193',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      },
      '/ws': {
        target: 'ws://54.180.241.193:8081',
        ws: true,
        changeOrigin: true,
        rewriteWsOrigin: true,
      }
    }
  }
});