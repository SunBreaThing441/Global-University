import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createMeridianRouter } from '@meridian/router';
import App from './App.vue';

export function initMeridianApp(rootSelector = '#meridian-root') {
  const app = createApp(App);
  const pinia = createPinia();
  const router = createMeridianRouter(true);

  app.use(pinia);
  app.use(router);

  const target = document.querySelector(rootSelector) || document.body.appendChild(document.createElement('div'));
  app.mount(target);

  return app;
}

if (typeof document !== 'undefined' && !document.querySelector('meta[name="meridian-manual-boot"]')) {
  initMeridianApp('#app');
}
