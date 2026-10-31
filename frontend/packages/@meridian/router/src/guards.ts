import { Router } from 'vue-router';
import { useAuthStore, RoleLevel, RouteSecurityMeta } from '@meridian/auth';

export function setupNavigationGuards(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // 1. Ensure Session is Initialized
    if (!authStore.isInitialized) {
      await authStore.initSession();
    }

    const meta = to.meta as RouteSecurityMeta;

    // 2. Redirect Authenticated Users Away from Guest-Only Pages (e.g. /signin)
    if (meta?.guestOnly && authStore.isAuthenticated) {
      return next({ name: 'DashboardDispatcher' });
    }

    // 3. Enforce Authentication Requirement
    if (meta?.requiresAuth && !authStore.isAuthenticated) {
      return next({
        name: 'SignIn',
        query: { redirect: to.fullPath },
      });
    }

    // 4. Enforce Hierarchical Role-Based Access Control (RBAC)
    if (meta?.minimumRole !== undefined) {
      const userLevel = authStore.roleLevel;
      if (userLevel < meta.minimumRole) {
        // Insufficient role privilege
        return next({
          name: 'Unauthorized',
          query: {
            required: meta.minimumRole,
            actual: userLevel,
            attempted: to.fullPath,
          },
        });
      }
    }

    // 5. Enforce Device Permissions
    if (meta?.requiresContentManagement && !authStore.canManageContent) {
      return next({ name: 'Unauthorized' });
    }

    // 6. Navigation Allowed — Refresh Session Heartbeat
    authStore.refreshSessionHeartbeat();
    next();
  });
}
