import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

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
