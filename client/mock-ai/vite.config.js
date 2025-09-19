import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',           // production folder
    chunkSizeWarningLimit: 2000, // optional: suppress warnings for large chunks
  },
  server: {
    port: 5173,               // dev server port
  },
  base: '/',                  // ✅ ensures assets load correctly in production
});
