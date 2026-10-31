<template>
  <div class="mds-card-skeleton" aria-hidden="true">
    <div class="skeleton-media shimmer" />
    <div class="skeleton-body">
      <div class="skeleton-badge shimmer" />
      <div class="skeleton-title shimmer" />
      <div class="skeleton-text shimmer" />
      <div class="skeleton-text skeleton-text--short shimmer" />
      <div class="skeleton-footer shimmer" />
    </div>
  </div>
</template>

<style scoped>
.mds-card-skeleton {
  display: flex;
  flex-direction: column;
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  overflow: hidden;
}

.skeleton-media {
  inline-size: 100%;
  aspect-ratio: 16 / 9;
  background: var(--mds-color-surface-elevated);
}

.skeleton-body {
  padding: var(--mds-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--mds-space-3);
}

.skeleton-badge {
  inline-size: 80px;
  block-size: 20px;
  border-radius: var(--mds-radius-full);
}

.skeleton-title {
  inline-size: 75%;
  block-size: 22px;
  border-radius: var(--mds-radius-sm);
}

.skeleton-text {
  inline-size: 100%;
  block-size: 14px;
  border-radius: var(--mds-radius-sm);
}

.skeleton-text--short {
  inline-size: 60%;
}

.skeleton-footer {
  inline-size: 100%;
  block-size: 38px;
  border-radius: var(--mds-radius-md);
  margin-block-start: var(--mds-space-2);
}

/* Shimmer Animation */
.shimmer {
  background: linear-gradient(
    90deg,
    var(--mds-color-surface-elevated) 0%,
    var(--mds-color-surface-ground) 50%,
    var(--mds-color-surface-elevated) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
