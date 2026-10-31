<template>
  <div class="user-profile-page">
    <header class="profile-header">
      <div class="profile-avatar" aria-hidden="true">
        {{ userInitial }}
      </div>
      <div class="profile-title-group">
        <h1 class="profile-name">{{ authStore.fullName || authStore.username }}</h1>
        <div class="profile-badges">
          <span
            v-for="role in authStore.roles"
            :key="role"
            class="role-badge"
            :class="`role-badge--${roleBadgeClass(role)}`"
          >
            {{ formatRole(role) }}
          </span>
          <span class="username-tag">@{{ authStore.username }}</span>
        </div>
      </div>
    </header>

    <div class="profile-grid">
      <!-- Section 1: Account Information -->
      <section class="profile-card" aria-labelledby="sec-account">
        <h2 id="sec-account" class="card-title">Account Details</h2>
        <dl class="details-list">
          <div class="detail-row">
            <dt>Full Name</dt>
            <dd>{{ authStore.fullName || 'Not specified' }}</dd>
          </div>
          <div class="detail-row">
            <dt>Username</dt>
            <dd>{{ authStore.username }}</dd>
          </div>
          <div class="detail-row">
            <dt>Facility ID</dt>
            <dd class="mono-id">{{ authStore.facilityId || 'Global' }}</dd>
          </div>
          <div class="detail-row">
            <dt>Device Content Manager</dt>
            <dd>{{ authStore.canManageContent ? 'Authorized' : 'Standard' }}</dd>
          </div>
        </dl>
      </section>

      <!-- Section 2: Security & Password Update -->
      <section class="profile-card" aria-labelledby="sec-security">
        <h2 id="sec-security" class="card-title">Security & Password</h2>
        <form class="password-form" @submit.prevent="updatePassword">
          <div class="form-group">
            <label for="current-pw">Current Password</label>
            <input
              id="current-pw"
              v-model="currentPassword"
              type="password"
              class="mds-input"
              required
              autocomplete="current-password"
            />
          </div>

          <div class="form-group">
            <label for="new-pw">New Password</label>
            <input
              id="new-pw"
              v-model="newPassword"
              type="password"
              class="mds-input"
              required
              autocomplete="new-password"
            />
          </div>

          <div v-if="statusMessage" :class="['status-box', `status--${statusType}`]">
            {{ statusMessage }}
          </div>

          <button
            type="submit"
            class="mds-button mds-button--primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Updating...' : 'Save New Password' }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore, getCsrfToken, UserKind } from '@meridian/auth';

const authStore = useAuthStore();

const currentPassword = ref('');
const newPassword = ref('');
const isSubmitting = ref(false);
const statusMessage = ref('');
const statusType = ref<'success' | 'error'>('success');

const userInitial = computed(() => {
  const name = authStore.fullName || authStore.username;
  return name ? name.charAt(0).toUpperCase() : '?';
});

function formatRole(role: UserKind): string {
  switch (role) {
    case UserKind.SUPERUSER: return 'Superadmin';
    case UserKind.ADMIN: return 'Facility Admin';
    case UserKind.COACH: return 'Facility Coach';
    case UserKind.ASSIGNABLE_COACH: return 'Class Coach';
    case UserKind.LEARNER: return 'Learner';
    default: return role;
  }
}

function roleBadgeClass(role: UserKind): string {
  if (role === UserKind.SUPERUSER || role === UserKind.ADMIN) return 'admin';
  if (role === UserKind.COACH || role === UserKind.ASSIGNABLE_COACH) return 'coach';
  return 'learner';
}

async function updatePassword() {
  isSubmitting.value = true;
  statusMessage.value = '';
  try {
    const csrfToken = getCsrfToken();
    await axios.patch(
      `/api/auth/facilityuser/${authStore.currentUserId}/`,
      {
        password: newPassword.value,
      },
      {
        headers: {
          'X-CSRFToken': csrfToken ?? '',
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );
    statusType.value = 'success';
    statusMessage.value = 'Password updated successfully.';
    currentPassword.value = '';
    newPassword.value = '';
  } catch (err: any) {
    statusType.value = 'error';
    statusMessage.value = err?.response?.data?.detail ?? 'Failed to update password. Please check your credentials.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.user-profile-page {
  max-inline-size: 1040px;
  margin-inline: auto;
  padding-block: var(--mds-space-6);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: var(--mds-space-4);
  margin-block-end: var(--mds-space-8);
  padding: var(--mds-space-6);
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
}

.profile-avatar {
  inline-size: 64px;
  block-size: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mds-color-brand-primary), var(--mds-color-brand-secondary));
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 700;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--mds-color-text-primary);
  margin: 0 0 var(--mds-space-2) 0;
}

.profile-badges {
  display: flex;
  align-items: center;
  gap: var(--mds-space-2);
}

.role-badge {
  padding-inline: var(--mds-space-2);
  padding-block: var(--mds-space-1);
  border-radius: var(--mds-radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.role-badge--admin {
  background: rgba(220, 38, 38, 0.1);
  color: var(--mds-color-status-error);
}

.role-badge--coach {
  background: rgba(14, 116, 144, 0.1);
  color: var(--mds-color-brand-secondary);
}

.role-badge--learner {
  background: rgba(5, 150, 105, 0.1);
  color: var(--mds-color-status-success);
}

.username-tag {
  color: var(--mds-color-text-tertiary);
  font-size: 0.875rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--mds-space-6);
}

.profile-card {
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  padding: var(--mds-space-6);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  margin-block: 0 var(--mds-space-4);
  padding-block-end: var(--mds-space-3);
  border-block-end: 1px solid var(--mds-color-border-subtle);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding-block: var(--mds-space-2);
  border-block-end: 1px dashed var(--mds-color-border-subtle);
}

.detail-row dt {
  color: var(--mds-color-text-secondary);
  font-size: 0.875rem;
}

.detail-row dd {
  color: var(--mds-color-text-primary);
  font-weight: 600;
  margin: 0;
}

.mono-id {
  font-family: monospace;
  font-size: 0.8125rem;
}

.password-form {
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
  padding-inline: var(--mds-space-3);
  padding-block: var(--mds-space-2);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-md);
  background: var(--mds-color-surface-ground);
  color: var(--mds-color-text-primary);
  font-size: 0.9375rem;
  outline: none;
}

.mds-input:focus {
  border-color: var(--mds-color-brand-secondary);
  box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
}

.status-box {
  padding: var(--mds-space-3);
  border-radius: var(--mds-radius-md);
  font-size: 0.875rem;
}

.status--success {
  background: rgba(5, 150, 105, 0.1);
  color: var(--mds-color-status-success);
}

.status--error {
  background: rgba(220, 38, 38, 0.1);
  color: var(--mds-color-status-error);
}

.mds-button {
  padding-inline: var(--mds-space-5);
  padding-block: var(--mds-space-3);
  border-radius: var(--mds-radius-md);
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  background: var(--mds-color-brand-primary);
  color: #FFFFFF;
  transition: opacity 0.2s ease;
}

.mds-button:hover:not(:disabled) {
  opacity: 0.9;
}

.mds-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
