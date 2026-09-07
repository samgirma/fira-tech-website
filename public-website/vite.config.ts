import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  build: {
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
    },
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: true,
  },
})
