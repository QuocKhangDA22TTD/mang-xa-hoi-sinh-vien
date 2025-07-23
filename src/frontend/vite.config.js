import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['mang-xa-hoi-sinh-vien-production.up.railway.app'],
    host: true,
    port: 5173,
  },
  define: {
    // Expose env vars to client
    __API_URL__: JSON.stringify(process.env.VITE_API_URL),
  },
});
