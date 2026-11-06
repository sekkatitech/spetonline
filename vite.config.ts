import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// The Apple catalogue and quote endpoints are Netlify functions, which neither
// `vite` nor `vite preview` serves. Run `npm run dev:functions` alongside them
// to answer those routes locally instead of showing the "couldn't load the
// range" state.
const functionsOrigin = process.env.FUNCTIONS_ORIGIN ?? 'http://localhost:8888';
const functionsProxy = {
  '/.netlify/functions': { target: functionsOrigin, changeOrigin: true },
  // Functions with their own path (chat, contact, business registration).
  '/api': { target: functionsOrigin, changeOrigin: true },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: functionsProxy,
    },
    preview: {
      proxy: functionsProxy,
    },
    build: {
      manifest: true,
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Supabase client
            'vendor-supabase': ['@supabase/supabase-js'],
            // Animation & state
            'vendor-motion': ['motion/react'],
            'vendor-zustand': ['zustand'],
            // Icons
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  };
});
