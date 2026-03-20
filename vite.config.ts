import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/tests/setup.ts'],
    passWithNoTests: true,
    env: {
      VITE_API_URL: 'http://localhost:5000',
    },
    coverage: {
      provider: 'v8',
      // Scope to frontend source only — excludes backend files from the gate
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/tests/**'],
      // Conservative baseline calibrated against current ~24% file coverage.
      // Raise incrementally as test coverage grows.
      thresholds: { lines: 20, functions: 40, branches: 30, statements: 20 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@vsaas/types': path.resolve(__dirname, './packages/types/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          query:   ['@tanstack/react-query'],
          icons:   ['react-icons'],
        },
      },
    },
  },
});
