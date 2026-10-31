<template>
  <span
    class="mds-badge"
    :class="[
      `mds-badge--${variant}`,
      `mds-badge--${size}`,
      { 'mds-badge--pill': pill },
    ]"
  >
    <slot name="icon" />
    <span class="mds-badge__label">
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'unesco';
    size?: 'sm' | 'md';
    pill?: boolean;
  }>(),
  {
    variant: 'default',
    size: 'md',
    pill: true,
  }
);
</script>

<style scoped>
.mds-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--mds-space-1);
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  border: 1px solid transparent;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

/* Sizes */
.mds-badge--sm {
  padding-inline: var(--mds-space-2);
  padding-block: var(--mds-space-1);
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
}

.mds-badge--md {
  padding-inline: var(--mds-space-3);
  padding-block: calc(var(--mds-space-1) * 1.5);
  font-size: 0.75rem;
  letter-spacing: 0.03em;
}

/* Pill vs Radius */
.mds-badge--pill {
  border-radius: var(--mds-radius-full);
}

.mds-badge:not(.mds-badge--pill) {
  border-radius: var(--mds-radius-sm);
}

/* Variants */
.mds-badge--default {
  background: var(--mds-color-surface-elevated);
  color: var(--mds-color-text-secondary);
  border-color: var(--mds-color-border-subtle);
}

.mds-badge--primary {
  background: rgba(14, 116, 144, 0.12);
  color: var(--mds-color-brand-secondary);
  border-color: rgba(14, 116, 144, 0.25);
}

.mds-badge--success {
  background: rgba(5, 150, 105, 0.12);
  color: var(--mds-color-status-success);
  border-color: rgba(5, 150, 105, 0.25);
}

.mds-badge--warning {
  background: rgba(217, 119, 6, 0.12);
  color: var(--mds-color-status-warning);
  border-color: rgba(217, 119, 6, 0.25);
}

.mds-badge--error {
  background: rgba(220, 38, 38, 0.12);
  color: var(--mds-color-status-error);
  border-color: rgba(220, 38, 38, 0.25);
}

.mds-badge--unesco {
  background: rgba(11, 37, 89, 0.08);
  color: var(--mds-color-brand-primary);
  border-color: rgba(11, 37, 89, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
</style>
