<template>
  <div class="mds-error-banner" role="alert">
    <div class="icon-wrap" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="currentColor" class="error-svg">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
    </div>

    <div class="message-group">
      <p class="error-title">{{ title }}</p>
      <p class="error-detail">{{ message }}</p>
    </div>

    <div v-if="showRetry" class="action-wrap">
      <button type="button" class="retry-btn" @click="$emit('retry')">
        Try Again
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    message: string;
    showRetry?: boolean;
  }>(),
  {
    title: 'Connection Issue',
    showRetry: true,
  }
);

defineEmits<{ (e: 'retry'): void }>();
</script>

<style scoped>
.mds-error-banner {
  display: flex;
  align-items: center;
  gap: var(--mds-space-4);
  padding: var(--mds-space-4) var(--mds-space-5);
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.3);
  border-radius: var(--mds-radius-lg);
  color: var(--mds-color-text-primary);
  margin-block: var(--mds-space-4);
}

.icon-wrap {
  color: var(--mds-color-status-error);
  display: flex;
  align-items: center;
}

.error-svg {
  inline-size: 24px;
  block-size: 24px;
}

.message-group {
  flex: 1;
}

.error-title {
  font-weight: 700;
  font-size: 0.9375rem;
  margin: 0;
  color: var(--mds-color-status-error);
}

.error-detail {
  font-size: 0.8125rem;
  color: var(--mds-color-text-secondary);
  margin: var(--mds-space-1) 0 0 0;
}

.retry-btn {
  padding-inline: var(--mds-space-4);
  padding-block: var(--mds-space-2);
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-md);
  font-weight: 600;
  font-size: 0.8125rem;
  color: var(--mds-color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--mds-color-surface-elevated);
  border-color: var(--mds-color-brand-secondary);
}
</style>
