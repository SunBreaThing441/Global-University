import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { UserKind, RoleLevel, UserSessionData, LoginCredentials } from './types';
import { getHighestRoleLevel, hasMinimumRole } from './roleHierarchy';
import { getCsrfToken, ensureCsrfTokenPrimed } from './csrf';

export const useAuthStore = defineStore('meridian-auth', () => {
  // Memory-Only Session State (Protects against XSS token harvesting)
  const session = ref<UserSessionData>({
    username: '',
    full_name: '',
    user_id: null,
    facility_id: null,
    kind: [UserKind.ANONYMOUS],
    can_manage_content: false,
    full_facility_import: true,
  });

  const isInitialized = ref(false);
  const isAuthenticating = ref(false);
  const lastActivityTime = ref<number>(Date.now());

  // Multi-Tab Session Synchronization via BroadcastChannel
  const sessionChannel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('meridian-session-channel')
    : null;

  if (sessionChannel) {
    sessionChannel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT' || event.data?.type === 'SESSION_EXPIRED') {
        session.value = {
          username: '',
          full_name: '',
          user_id: null,
          facility_id: null,
          kind: [UserKind.ANONYMOUS],
          can_manage_content: false,
          full_facility_import: true,
        };
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
          window.location.href = '/signin?reason=session_expired';
        }
      }
    };
  }

  function broadcastSessionEvent(type: 'LOGOUT' | 'SESSION_EXPIRED') {
    sessionChannel?.postMessage({ type });
  }

  // --- Getters ---
  const isAuthenticated = computed(() => !session.value.kind.includes(UserKind.ANONYMOUS));
  const currentUserId = computed(() => session.value.user_id);
  const username = computed(() => session.value.username);
  const fullName = computed(() => session.value.full_name);
  const facilityId = computed(() => session.value.facility_id);
  const roles = computed(() => session.value.kind);
  const roleLevel = computed(() => getHighestRoleLevel(session.value.kind));

  // Role hierarchy booleans matching backend
  const isLearner = computed(() => session.value.kind.includes(UserKind.LEARNER));
  const isClassCoach = computed(() => session.value.kind.includes(UserKind.ASSIGNABLE_COACH));
  const isFacilityCoach = computed(() => session.value.kind.includes(UserKind.COACH));
  const isCoach = computed(() => isClassCoach.value || isFacilityCoach.value);
  const isFacilityAdmin = computed(() => session.value.kind.includes(UserKind.ADMIN));
  const isSuperuser = computed(() => session.value.kind.includes(UserKind.SUPERUSER));
  const isAdmin = computed(() => isFacilityAdmin.value || isSuperuser.value);
  const canManageContent = computed(() => session.value.can_manage_content);

  // --- Actions ---

  /**
   * Initializes session from DOM bootstrap (<template data-plugin="kolibri">) or API.
   */
  async function initSession(): Promise<void> {
    if (isInitialized.value) return;

    // Check DOM bootstrap injected by Django WebpackBundleHook
    if (typeof document !== 'undefined') {
      const bootstrapTag = document.querySelector('template[data-plugin="kolibri"]');
      if (bootstrapTag) {
        try {
          const data = JSON.parse(bootstrapTag.innerHTML.trim());
          if (data.session) {
            session.value = data.session;
            isInitialized.value = true;
            return;
          }
        } catch {
          // Fallback to network request
        }
      }
    }

    try {
      const response = await axios.get<UserSessionData>('/api/auth/session/current/', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      session.value = response.data;
    } catch {
      session.value = {
        username: '',
        full_name: '',
        user_id: null,
        facility_id: null,
        kind: [UserKind.ANONYMOUS],
        can_manage_content: false,
        full_facility_import: true,
      };
    } finally {
      isInitialized.value = true;
    }
  }

  /**
   * Authenticates against Django SessionViewSet with cold-start CSRF priming.
   */
  async function login(credentials: LoginCredentials): Promise<UserSessionData> {
    isAuthenticating.value = true;
    try {
      const csrfToken = await ensureCsrfTokenPrimed();
      const response = await axios.post<UserSessionData>(
        '/api/auth/session/',
        {
          ...credentials,
          active: true,
        },
        {
          headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );

      session.value = response.data;
      lastActivityTime.value = Date.now();
      return response.data;
    } finally {
      isAuthenticating.value = false;
    }
  }

  /**
   * Terminates session on Django backend and clears in-memory state.
   */
  async function logout(): Promise<void> {
    const csrfToken = getCsrfToken();
    try {
      await axios.delete('/api/auth/session/current/', {
        headers: {
          'X-CSRFToken': csrfToken ?? '',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch {
      // Settle anyway
    } finally {
      session.value = {
        username: '',
        full_name: '',
        user_id: null,
        facility_id: null,
        kind: [UserKind.ANONYMOUS],
        can_manage_content: false,
        full_facility_import: true,
      };
      broadcastSessionEvent('LOGOUT');
    }
  }

  /**
   * Sends heartbeat keep-alive to refresh session and detect remote revocation.
   */
  async function refreshSessionHeartbeat(): Promise<void> {
    if (!isAuthenticated.value) return;
    try {
      const response = await axios.put<UserSessionData>(
        '/api/auth/session/current/',
        { active: true },
        {
          headers: {
            'X-CSRFToken': getCsrfToken() ?? '',
            'X-Requested-With': 'XMLHttpRequest',
          },
        }
      );
      session.value = response.data;
      lastActivityTime.value = Date.now();
    } catch (error: any) {
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        broadcastSessionEvent('SESSION_EXPIRED');
        await logout();
      }
    }
  }

  function checkPermission(requiredLevel: RoleLevel): boolean {
    return hasMinimumRole(session.value.kind, requiredLevel);
  }

  return {
    session,
    isInitialized,
    isAuthenticating,
    isAuthenticated,
    currentUserId,
    username,
    fullName,
    facilityId,
    roles,
    roleLevel,
    isLearner,
    isClassCoach,
    isFacilityCoach,
    isCoach,
    isFacilityAdmin,
    isSuperuser,
    isAdmin,
    canManageContent,
    initSession,
    login,
    logout,
    refreshSessionHeartbeat,
    checkPermission,
  };
});
