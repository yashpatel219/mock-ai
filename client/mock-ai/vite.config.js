import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // make sure tailwind plugin comes after react
  ],
  build: {
    outDir: 'dist', // default output folder for Vite build
  },
  server: {
    port: 5173,
  },
  // Optional: for SPA routing on static hosts
  // Not strictly needed for Vercel (use vercel.json rewrites)
  // base: '/', 
});
