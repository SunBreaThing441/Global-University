<template>
  <div class="signin-page">
    <div class="signin-card">
      <header class="signin-header">
        <div class="brand-glyph" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="2" />
            <ellipse cx="16" cy="16" rx="5.5" ry="13" stroke="currentColor" stroke-width="1.5" />
            <line x1="3" y1="16" x2="29" y2="16" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </div>
        <span class="unesco-tag">UNESCO SDG 4 • Social Impact Platform</span>
        <h1 class="signin-title">Sign In to Meridian Global</h1>
        <p class="signin-subtitle">Access global education and localized curricula.</p>
      </header>

      <form class="signin-form" @submit.prevent="handleSignIn">
        <div class="form-group">
          <label for="username-input">Username</label>
          <input
            id="username-input"
            v-model="username"
            type="text"
            class="mds-input"
            autocomplete="username"
            required
            placeholder="Enter your username"
          />
        </div>

        <div class="form-group">
          <label for="password-input">Password</label>
          <input
            id="password-input"
            v-model="password"
            type="password"
            class="mds-input"
            autocomplete="current-password"
            required
            placeholder="Enter your password"
          />
        </div>

        <div v-if="errorMessage" class="error-banner" role="alert">
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@meridian/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');

async function handleSignIn() {
  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    });

    const redirectPath = (route.query.redirect as string) || '/dashboard';
    router.replace(redirectPath);
  } catch (err: any) {
    errorMessage.value =
      err?.response?.data?.detail ||
      err?.response?.data?.[0] ||
      'Invalid credentials. Please verify your username and password.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.signin-page {
  min-block-size: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--mds-space-6);
}

.signin-card {
  inline-size: 100%;
  max-inline-size: 440px;
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  padding: var(--mds-space-8);
  box-shadow: 0 16px 36px rgba(11, 37, 89, 0.08);
}

.signin-header {
  text-align: center;
  margin-block-end: var(--mds-space-6);
}

.brand-glyph {
  inline-size: 48px;
  block-size: 48px;
  color: var(--mds-color-brand-primary);
  margin-inline: auto;
  margin-block-end: var(--mds-space-3);
}

.brand-glyph svg {
  inline-size: 100%;
  block-size: 100%;
}

.unesco-tag {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--mds-color-brand-secondary);
  text-transform: uppercase;
  display: block;
  margin-block-end: var(--mds-space-2);
}

.signin-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--mds-color-text-primary);
  margin: 0;
}

.signin-subtitle {
  font-size: 0.875rem;
  color: var(--mds-color-text-secondary);
  margin: var(--mds-space-1) 0 0 0;
}

.signin-form {
  display: flex;
  flex-direction: column;
  gap: var(--mds-space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--mds-space-1);
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mds-color-text-secondary);
}

.mds-input {
  min-block-size: 44px;
  padding-inline: var(--mds-space-3);
  padding-block: var(--mds-space-2);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-md);
  background: var(--mds-color-surface-ground);
  color: var(--mds-color-text-primary);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.mds-input:focus {
  border-color: var(--mds-color-brand-secondary);
  box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
}

.error-banner {
  padding: var(--mds-space-3);
  background: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--mds-radius-md);
  color: var(--mds-color-status-error);
  font-size: 0.8125rem;
  font-weight: 600;
}

.submit-btn {
  min-block-size: 44px;
  background: linear-gradient(135deg, var(--mds-color-brand-primary), var(--mds-color-brand-secondary));
  color: #FFFFFF;
  border: none;
  border-radius: var(--mds-radius-md);
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  margin-block-start: var(--mds-space-2);
  transition: opacity 0.2s ease, transform 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
