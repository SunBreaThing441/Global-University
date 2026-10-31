<template>
  <button
    :class="[
      'mds-button',
      `mds-button--${variant}`,
      `mds-button--${size}`,
      { 'mds-button--loading': loading, 'mds-button--disabled': disabled }
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading"
  >
    <span v-if="loading" class="mds-button__spinner" aria-hidden="true" />
    <span v-if="$slots.iconStart" class="mds-button__icon-start">
      <slot name="iconStart" />
    </span>
    <span class="mds-button__label"><slot /></span>
    <span v-if="$slots.iconEnd" class="mds-button__icon-end">
      <slot name="iconEnd" />
    </span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'glass' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
  }
);
</script>

<style scoped>
.mds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mds-space-2, 0.5rem);
  min-inline-size: 44px;
  min-block-size: 44px; /* WCAG 2.5.5 Touch Target Compliance */
  padding-inline: var(--mds-space-4, 1rem);
  padding-block: var(--mds-space-2, 0.5rem);
  border-radius: var(--mds-radius-md, 8px);
  font-family: var(--mds-font-display, inherit);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
  outline: none;
}

.mds-button--primary {
  background: linear-gradient(135deg, var(--mds-color-brand-primary, #0B2559), var(--mds-color-brand-secondary, #0E7490));
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(11, 37, 89, 0.25);
}

.mds-button--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 180, 216, 0.35);
  filter: brightness(1.08);
}

.mds-button--secondary {
  background: var(--mds-color-surface-elevated, #F1F3F5);
  border-color: var(--mds-color-border-subtle, #E2E8F0);
  color: var(--mds-color-text-primary, #0F172A);
}

.mds-button--secondary:hover:not(:disabled) {
  background: var(--mds-color-surface-base, #FFFFFF);
  border-color: var(--mds-color-brand-secondary, #0E7490);
}

.mds-button--glass {
  background: var(--mds-color-surface-glass, rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(16px);
  border-color: var(--mds-color-surface-glass-border, rgba(206, 212, 218, 0.85));
  color: var(--mds-color-text-primary, #0F172A);
}

.mds-button--ghost {
  background: transparent;
  color: var(--mds-color-text-primary, #0F172A);
}

.mds-button--ghost:hover:not(:disabled) {
  background: var(--mds-color-surface-elevated, #F1F3F5);
}

.mds-button:focus-visible {
  box-shadow: 0 0 0 3px var(--mds-color-surface-base, #FFFFFF), 0 0 0 6px var(--mds-color-brand-secondary, #00B4D8);
}

.mds-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none !important;
}

.mds-button__spinner {
  inline-size: 16px;
  block-size: 16px;
  border: 2px solid currentColor;
  border-block-start-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
