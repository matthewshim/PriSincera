import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          /* React core + router — rarely changes, long-term cache */
          vendor: ['react', 'react-dom', 'react-router-dom'],
          /* DOMPurify — used only by PriSignalIssue */
          sanitize: ['dompurify'],
        },
      },
    },
  },
});
