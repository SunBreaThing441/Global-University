<template>
  <div class="mds-sync-status" role="status" :aria-live="isSyncing ? 'polite' : 'off'">
    <div class="indicator-dot" :class="`indicator-dot--${status}`" aria-hidden="true" />

    <div class="status-content">
      <span class="status-label">{{ statusText }}</span>
      <span v-if="lastSyncedText && status !== 'syncing'" class="status-timestamp">
        {{ lastSyncedText }}
      </span>
    </div>

    <button
      v-if="canManualSync"
      type="button"
      class="sync-action-btn"
      :disabled="isSyncing"
      :aria-label="t('syncNow')"
      @click="$emit('sync')"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        class="sync-icon"
        :class="{ 'sync-icon--spin': isSyncing }"
        aria-hidden="true"
      >
        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMeridianTranslator } from '@meridian/i18n';

export type SyncState = 'synced' | 'syncing' | 'offline' | 'error';

const props = withDefaults(
  defineProps<{
    status: SyncState;
    lastSynced?: Date | string | null;
    canManualSync?: boolean;
  }>(),
  {
    status: 'synced',
    lastSynced: null,
    canManualSync: true,
  }
);

defineEmits<{
  (e: 'sync'): void;
}>();

const { t } = useMeridianTranslator('SyncStatus', {
  synced: { message: 'Mesh Synced', context: 'Status text' },
  syncing: { message: 'Syncing with Peer...', context: 'Status text' },
  offline: { message: 'Offline Mode', context: 'Status text' },
  error: { message: 'Sync Interrupted', context: 'Status text' },
  syncNow: { message: 'Trigger synchronization', context: 'Action button' },
  justNow: { message: 'Just now', context: 'Timestamp' },
});

const isSyncing = computed(() => props.status === 'syncing');

const statusText = computed(() => {
  switch (props.status) {
    case 'synced': return t('synced');
    case 'syncing': return t('syncing');
    case 'offline': return t('offline');
    case 'error': return t('error');
    default: return '';
  }
});

const lastSyncedText = computed(() => {
  if (!props.lastSynced) return null;
  return t('justNow');
});
</script>

<style scoped>
.mds-sync-status {
  display: inline-flex;
  align-items: center;
  gap: var(--mds-space-2);
  padding-inline: var(--mds-space-3);
  padding-block: var(--mds-space-1);
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-full);
}

.indicator-dot {
  inline-size: 8px;
  block-size: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.indicator-dot--synced {
  background: var(--mds-color-status-success);
  box-shadow: 0 0 6px rgba(5, 150, 105, 0.4);
}

.indicator-dot--syncing {
  background: var(--mds-color-brand-secondary);
  animation: pulse 1.2s infinite;
}

.indicator-dot--offline {
  background: var(--mds-color-text-tertiary);
}

.indicator-dot--error {
  background: var(--mds-color-status-error);
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.status-content {
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  line-height: 1.2;
}

.status-timestamp {
  font-size: 0.6875rem;
  color: var(--mds-color-text-tertiary);
  line-height: 1;
}

.sync-action-btn {
  inline-size: 24px;
  block-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--mds-radius-full);
  color: var(--mds-color-text-secondary);
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.sync-action-btn:hover:not(:disabled) {
  color: var(--mds-color-brand-primary);
  background: var(--mds-color-surface-elevated);
}

.sync-icon {
  inline-size: 14px;
  block-size: 14px;
}

.sync-icon--spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
