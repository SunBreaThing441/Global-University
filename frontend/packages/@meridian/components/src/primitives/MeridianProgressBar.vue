<template>
  <div
    class="mds-progress-container"
    role="progressbar"
    :aria-valuenow="clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
  >
    <div v-if="showLabel" class="mds-progress-header">
      <span class="mds-progress-label">{{ label }}</span>
      <span class="mds-progress-percent">{{ clampedValue }}%</span>
    </div>

    <div class="mds-progress-track">
      <div
        class="mds-progress-fill"
        :class="[`mds-progress-fill--${variant}`]"
        :style="{ inlineSize: `${clampedValue}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    label?: string;
    variant?: 'primary' | 'success' | 'amber';
    showLabel?: boolean;
  }>(),
  {
    value: 0,
    label: 'Progress',
    variant: 'primary',
    showLabel: false,
  }
);

const clampedValue = computed(() => Math.max(0, Math.min(100, Math.round(props.value))));
</script>

<style scoped>
.mds-progress-container {
  inline-size: 100%;
}

.mds-progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-block-end: var(--mds-space-1);
  color: var(--mds-color-text-secondary);
}

.mds-progress-track {
  block-size: 8px;
  inline-size: 100%;
  background: var(--mds-color-surface-elevated);
  border-radius: var(--mds-radius-full);
  overflow: hidden;
}

.mds-progress-fill {
  block-size: 100%;
  border-radius: var(--mds-radius-full);
  transition: inline-size 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.mds-progress-fill--primary {
  background: linear-gradient(90deg, var(--mds-color-brand-primary), var(--mds-color-brand-secondary));
}

.mds-progress-fill--success {
  background: var(--mds-color-status-success);
}

.mds-progress-fill--amber {
  background: var(--mds-color-brand-accent);
}
</style>
