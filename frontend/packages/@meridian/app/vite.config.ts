import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@meridian/design-tokens': path.resolve(__dirname, '../design-tokens'),
      '@meridian/i18n': path.resolve(__dirname, '../i18n/src'),
      '@meridian/api-client': path.resolve(__dirname, '../api-client/src'),
      '@meridian/auth': path.resolve(__dirname, '../auth/src'),
      '@meridian/components': path.resolve(__dirname, '../components/src'),
      '@meridian/composables': path.resolve(__dirname, '../composables/src'),
      '@meridian/router': path.resolve(__dirname, '../router/src'),
      '@meridian/views': path.resolve(__dirname, '../views/src'),
    },
  },
  optimizeDeps: {
    include: ['axios', 'qs', 'pinia', 'vue', 'vue-router'],
  },
  server: {
    port: 3001,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
