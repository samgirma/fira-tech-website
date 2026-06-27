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
    allowedHosts: ["impacts-latex-blue-possibly.trycloudflare.com"],
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create chunks based on module paths
          if (id.includes('node_modules')) {
            // Vendor libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor'
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui'
            }
            return 'vendor-libs'
          }
          
          // Feature-based chunks
          if (id.includes('admin') || id.includes('BlogDetail')) {
            return 'admin'
          }
          if (id.includes('Blogs') || id.includes('CommentsSection')) {
            return 'blog'
          }
          if (id.includes('AIAssistant')) {
            return 'ai'
          }
          if (id.includes('ErrorBoundary') || id.includes('SystemConfigLoader')) {
            return 'components'
          }
          
          // Default chunk
          return 'main'
        }
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'framer-motion']
    },
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: true,
  },
});
