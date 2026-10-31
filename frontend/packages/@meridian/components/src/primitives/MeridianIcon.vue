<template>
  <span
    class="mds-icon"
    :class="[
      `mds-icon--${size}`,
      {
        'mds-icon--navigational': directional,
        'mds-icon--spin': spin,
      },
    ]"
    :data-mirror="directional ? 'true' : undefined"
    aria-hidden="true"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg' | 'xl';
    directional?: boolean;
    spin?: boolean;
  }>(),
  {
    size: 'md',
    directional: false,
    spin: false,
  }
);
</script>

<style scoped>
.mds-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  color: inherit;
}

.mds-icon--sm {
  inline-size: 14px;
  block-size: 14px;
}

.mds-icon--md {
  inline-size: 18px;
  block-size: 18px;
}

.mds-icon--lg {
  inline-size: 24px;
  block-size: 24px;
}

.mds-icon--xl {
  inline-size: 32px;
  block-size: 32px;
}

.mds-icon :deep(svg) {
  inline-size: 100%;
  block-size: 100%;
}

.mds-icon--spin {
  animation: mds-spin 1s linear infinite;
}

@keyframes mds-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
