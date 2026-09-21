import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Support deployment at domain root or relative base path for GitHub Pages
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          leaflet: ['leaflet', 'react-leaflet'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        }
      }
    }
  }
});
