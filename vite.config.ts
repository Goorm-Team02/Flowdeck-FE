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
    proxy: {
      '/api': {
        target: 'http://54.180.241.193:8081',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // 브라우저가 보낸 Origin 및 Referer 헤더를 삭제하여 
            // 백엔드가 CORS 교차 출처 검사를 수행하지 못하게 원천 차단합니다.
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        }
      }
    }
  }
});