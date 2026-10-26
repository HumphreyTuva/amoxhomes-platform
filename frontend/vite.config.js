import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const onNetlify = !!process.env.NETLIFY;                 // Netlify sets this automatically during its build
const API = 'https://amoxhomes.pythonanywhere.com';         // where /api, /media etc. are forwarded in dev

// Build on your PC:  files go to ../core/static/app and are served by Django under /static/app/.
// Build on Netlify:  files go to ./dist with base "/".
// Dev (npm run dev): serves on :5173 and forwards /api, /media, /static, /admin, /console to PythonAnywhere.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' && !onNetlify ? '/static/app/' : '/',
  build: onNetlify ? { outDir: 'dist', emptyOutDir: true } : { outDir: '../core/static/app', emptyOutDir: true },
  server: {
    port: 5173,
    proxy: Object.fromEntries(
      ['/api', '/media', '/static', '/admin', '/console'].map((p) => [
        p,
        {
          target: API,
          changeOrigin: true,
          secure: true,
          // Django rejects form posts whose Origin is not its own, so present the live site's address.
          configure: (proxy) => proxy.on('proxyReq', (req) => { req.setHeader('origin', API); req.setHeader('referer', `${API}/`); }),
        },
      ])
    ),
  },
}));