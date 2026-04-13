import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/leaflet') || id.includes('react-leaflet')) {
            return 'vendor-maps';
          }
          if (id.includes('@stripe')) {
            return 'vendor-stripe';
          }
          if (id.includes('socket.io-client')) {
            return 'vendor-socket';
          }
          if (id.includes('node_modules/react') || id.includes('react-router-dom')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})

