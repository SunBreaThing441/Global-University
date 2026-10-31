import { createRouter, createWebHistory, createWebHashHistory, Router } from 'vue-router';
import { routes } from './routes';
import { setupNavigationGuards } from './guards';

export * from './routes';
export * from './guards';

export function createMeridianRouter(useHash = true): Router {
  const router = createRouter({
    history: useHash ? createWebHashHistory() : createWebHistory(),
    routes,
  });

  setupNavigationGuards(router);
  return router;
}
