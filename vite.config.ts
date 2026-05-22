import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
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
