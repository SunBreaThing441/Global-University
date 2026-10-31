<template>
  <header class="mds-app-bar">
    <div class="app-bar__container">
      <!-- Brand & Global Logo -->
      <div class="app-bar__brand">
        <router-link to="/dashboard" class="brand-link" aria-label="Meridian Global Home">
          <div class="brand-glyph" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2" />
              <ellipse cx="16" cy="16" rx="5.5" ry="13" stroke="currentColor" stroke-width="1.5" />
              <line x1="3" y1="16" x2="29" y2="16" stroke="currentColor" stroke-width="1.5" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-name">Meridian Global</span>
            <span class="brand-tag">UNESCO SDG 4</span>
          </div>
        </router-link>
      </div>

      <!-- Navigation Links -->
      <nav v-if="authStore.isAuthenticated" class="app-bar__nav" aria-label="Main Navigation">
        <router-link to="/dashboard" class="nav-link" active-class="nav-link--active">
          {{ t('navDashboard') }}
        </router-link>
        <router-link
          v-if="authStore.isCoach || authStore.isAdmin"
          to="/dashboard/coach"
          class="nav-link"
          active-class="nav-link--active"
        >
          {{ t('navCoach') }}
        </router-link>
        <router-link
          v-if="authStore.isAdmin"
          to="/dashboard/admin"
          class="nav-link"
          active-class="nav-link--active"
        >
          {{ t('navAdmin') }}
        </router-link>
      </nav>

      <!-- Utility Actions (Sync, Locale, User) -->
      <div class="app-bar__actions">
        <!-- Morango Sync Molecule -->
        <MeridianSyncStatus
          :status="syncStatus"
          :can-manual-sync="true"
          @sync="onSyncRequested"
        />

        <!-- Language Selector -->
        <div class="locale-selector">
          <button
            type="button"
            class="action-icon-btn"
            :aria-label="t('switchLanguage')"
            @click="cycleLocale"
          >
            <span class="locale-code">{{ currentLocale.toUpperCase() }}</span>
          </button>
        </div>

        <!-- Sunlight Contrast Mode Toggle -->
        <button
          type="button"
          class="action-icon-btn"
          :aria-label="t('toggleTheme')"
          @click="toggleTheme"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" class="theme-icon" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Profile & Logout (When Authenticated) -->
        <template v-if="authStore.isAuthenticated">
          <router-link to="/profile" class="user-chip" :aria-label="t('userProfile')">
            <span class="user-avatar" aria-hidden="true">
              {{ (authStore.fullName || authStore.username || '?').charAt(0).toUpperCase() }}
            </span>
            <span class="user-name">{{ authStore.fullName || authStore.username }}</span>
          </router-link>

          <button
            type="button"
            class="action-icon-btn logout-btn"
            :aria-label="t('signOut')"
            @click="onSignOut"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="logout-icon" aria-hidden="true">
              <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-3.293 3.293a1 1 0 01-1.414-1.414L11.586 7H7a1 1 0 110-2h4.586L9.293 2.707a1 1 0 011.414-1.414l3.293 3.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </template>

        <!-- Sign In Button (When Guest) -->
        <template v-else>
          <router-link to="/signin" class="mds-button mds-button--primary btn-sm">
            {{ t('signIn') }}
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMeridianTranslator, currentLocale, setLocale } from '@meridian/i18n';
import { useAuthStore } from '@meridian/auth/authStore';
import MeridianSyncStatus, { SyncState } from '../molecules/MeridianSyncStatus.vue';

const router = useRouter();
const authStore = useAuthStore();
const syncStatus = ref<SyncState>('synced');

const { t } = useMeridianTranslator('AppBar', {
  navDashboard: { message: 'Dashboard', context: 'Navigation' },
  navCoach: { message: 'Classroom Monitoring', context: 'Navigation' },
  navAdmin: { message: 'Facility Operations', context: 'Navigation' },
  switchLanguage: { message: 'Change language', context: 'Aria label' },
  toggleTheme: { message: 'Toggle sunlight mode', context: 'Aria label' },
  userProfile: { message: 'View profile', context: 'Aria label' },
  signOut: { message: 'Sign out', context: 'Aria label' },
  signIn: { message: 'Sign In', context: 'CTA button' },
});

const supportedLocales = ['en', 'es', 'fr', 'ar', 'hi'];

function cycleLocale() {
  const currentIndex = supportedLocales.indexOf(currentLocale.value);
  const nextIndex = (currentIndex + 1) % supportedLocales.length;
  setLocale(supportedLocales[nextIndex]);
}

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'sunlight' : current === 'sunlight' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
}

function onSyncRequested() {
  syncStatus.value = 'syncing';
  setTimeout(() => {
    syncStatus.value = 'synced';
  }, 2000);
}

async function onSignOut() {
  await authStore.logout();
  router.push('/signin');
}
</script>

<style scoped>
.mds-app-bar {
  background: var(--mds-color-surface-base);
  border-block-end: 1px solid var(--mds-color-border-subtle);
  position: sticky;
  inset-block-start: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.app-bar__container {
  max-inline-size: 1440px;
  margin-inline: auto;
  padding-inline: var(--mds-space-6);
  padding-block: var(--mds-space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mds-space-4);
}

.app-bar__brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: var(--mds-space-3);
  text-decoration: none;
  color: var(--mds-color-text-primary);
}

.brand-glyph {
  inline-size: 36px;
  block-size: 36px;
  color: var(--mds-color-brand-primary);
  display: flex;
  align-items: center;
}

.brand-glyph svg {
  inline-size: 100%;
  block-size: 100%;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-family: var(--mds-font-family-display, inherit);
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--mds-color-brand-primary);
  line-height: 1.2;
}

.brand-tag {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--mds-color-brand-secondary);
  text-transform: uppercase;
}

.app-bar__nav {
  display: flex;
  align-items: center;
  gap: var(--mds-space-4);
}

.nav-link {
  padding-inline: var(--mds-space-3);
  padding-block: var(--mds-space-2);
  border-radius: var(--mds-radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mds-color-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.nav-link:hover {
  color: var(--mds-color-text-primary);
  background: var(--mds-color-surface-elevated);
}

.nav-link--active {
  color: var(--mds-color-brand-primary);
  background: rgba(11, 37, 89, 0.06);
}

.app-bar__actions {
  display: flex;
  align-items: center;
  gap: var(--mds-space-3);
}

.action-icon-btn {
  inline-size: 36px;
  block-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mds-color-surface-elevated);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-full);
  color: var(--mds-color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  color: var(--mds-color-text-primary);
  border-color: var(--mds-color-brand-secondary);
}

.locale-code {
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}

.theme-icon,
.logout-icon {
  inline-size: 18px;
  block-size: 18px;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--mds-space-2);
  padding-inline: var(--mds-space-2);
  padding-block: var(--mds-space-1);
  border-radius: var(--mds-radius-full);
  background: var(--mds-color-surface-elevated);
  border: 1px solid var(--mds-color-border-subtle);
  text-decoration: none;
  color: var(--mds-color-text-primary);
  transition: border-color 0.2s ease;
}

.user-chip:hover {
  border-color: var(--mds-color-brand-secondary);
}

.user-avatar {
  inline-size: 26px;
  block-size: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mds-color-brand-primary), var(--mds-color-brand-secondary));
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  padding-inline-end: var(--mds-space-2);
}

.btn-sm {
  padding-inline: var(--mds-space-4);
  padding-block: var(--mds-space-2);
  font-size: 0.8125rem;
}
</style>
