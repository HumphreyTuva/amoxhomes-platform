import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Build: files go to ../core/static/app and are served by Django (WhiteNoise) under /static/app/.
// Dev:   `npm run dev` serves on :5173 and forwards /api, /media, /static, /admin, /console to Django on :8000.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/static/app/' : '/',
  build: { outDir: '../core/static/app', emptyOutDir: true },
  server: {
    port: 5173,
    proxy: Object.fromEntries(['/api', '/media', '/static', '/admin', '/console'].map((p) => [p, 'http://127.0.0.1:8080'])),
  },
}));
