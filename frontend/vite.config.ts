import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist/timed-automata-analysis',
    chunkSizeWarningLimit: 1100,
  },
  server: {
    open: true,
  },
});
