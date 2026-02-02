import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // We will run a separate express server for local dev if needed, OR use a plugin.
        // Actually, for "Simplest possible stack" and Vercel compatibility, 
        // using a simple Express server that serves static files AND api is better.
        // But with Vite, we usually want Vite's HMR.
        // Let's assume we run 'node server.js' which uses Vite as middleware OR just proxies.
        // For simplicity in this environment, I'll use this proxy config 
        // and assume the user runs `node api/server.js` in parallel or I provide a script.
        changeOrigin: true
      }
    }
  }
});
