import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false, // Disable the error overlay in browser
    },
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: if you want to use '@' as shortcut for /src
    },
  },
});
