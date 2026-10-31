<template>
  <div class="mds-empty-state">
    <div class="illustration-glyph" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" class="empty-svg">
        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4" />
        <ellipse cx="24" cy="24" rx="9" ry="20" stroke="currentColor" stroke-width="1.2" />
        <path d="M4 24h40" stroke="currentColor" stroke-width="1.2" />
      </svg>
    </div>

    <h3 class="empty-title">{{ title }}</h3>
    <p class="empty-description">{{ description }}</p>

    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>

<style scoped>
.mds-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--mds-space-12) var(--mds-space-6);
  background: var(--mds-color-surface-base);
  border: 1px dashed var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  margin-block: var(--mds-space-6);
}

.illustration-glyph {
  inline-size: 64px;
  block-size: 64px;
  color: var(--mds-color-brand-secondary);
  opacity: 0.6;
  margin-block-end: var(--mds-space-4);
}

.empty-svg {
  inline-size: 100%;
  block-size: 100%;
}

.empty-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  margin-block: 0 var(--mds-space-2);
}

.empty-description {
  font-size: 0.875rem;
  color: var(--mds-color-text-secondary);
  max-inline-size: 380px;
  line-height: 1.5;
  margin-block: 0 var(--mds-space-6);
}
</style>
