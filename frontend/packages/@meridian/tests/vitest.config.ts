import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [resolve(__dirname, './setup.ts')],
  },
  resolve: {
    alias: {
      '@meridian/components': resolve(__dirname, '../components/src'),
      '@meridian/auth': resolve(__dirname, '../auth/src'),
      '@meridian/composables': resolve(__dirname, '../composables/src'),
      '@meridian/i18n': resolve(__dirname, '../i18n/src'),
      '@meridian/api-client': resolve(__dirname, '../api-client/src'),
    },
  },
});
