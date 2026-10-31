<template>
  <div class="unauthorized-page" role="alert">
    <div class="unauthorized-card">
      <div class="icon-circle" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" class="lock-svg">
          <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" stroke-width="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" stroke-width="2" />
        </svg>
      </div>

      <h1 class="title">Access Restricted</h1>
      <p class="description">
        You do not have the required role privileges to access this workspace.
        This incident has been recorded according to facility security policies.
      </p>

      <div class="actions">
        <router-link to="/dashboard" class="mds-button mds-button--primary">
          Return to My Workspace
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unauthorized-page {
  min-block-size: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--mds-space-6);
}

.unauthorized-card {
  max-inline-size: 480px;
  text-align: center;
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  padding: var(--mds-space-8);
  box-shadow: 0 16px 36px rgba(11, 37, 89, 0.08);
}

.icon-circle {
  inline-size: 64px;
  block-size: 64px;
  border-radius: 50%;
  background: rgba(220, 38, 38, 0.1);
  color: var(--mds-color-status-error);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-inline: auto;
  margin-block-end: var(--mds-space-4);
}

.lock-svg {
  inline-size: 32px;
  block-size: 32px;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--mds-color-text-primary);
  margin-block: 0 var(--mds-space-2);
}

.description {
  color: var(--mds-color-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin-block: 0 var(--mds-space-6);
}

.actions {
  display: flex;
  justify-content: center;
}

.mds-button {
  padding-inline: var(--mds-space-6);
  padding-block: var(--mds-space-3);
  border-radius: var(--mds-radius-md);
  font-weight: 700;
  font-size: 0.9375rem;
  text-decoration: none;
  background: var(--mds-color-brand-primary);
  color: #FFFFFF;
  transition: opacity 0.2s ease;
}

.mds-button:hover {
  opacity: 0.9;
}
</style>
