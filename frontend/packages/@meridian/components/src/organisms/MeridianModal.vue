<template>
  <Teleport to="body">
    <Transition name="mds-modal-fade">
      <div
        v-if="isOpen"
        class="mds-modal-backdrop"
        role="presentation"
        @click.self="onBackdropClick"
        @keydown.esc="onClose"
      >
        <div
          ref="modalRef"
          class="mds-modal-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header class="mds-modal-header">
            <h2 :id="titleId" class="mds-modal-title">{{ title }}</h2>
            <button
              type="button"
              class="mds-modal-close-btn"
              :aria-label="closeLabel"
              @click="onClose"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" class="close-icon" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </header>

          <div class="mds-modal-body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="mds-modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    closeLabel?: string;
    closeOnBackdrop?: boolean;
  }>(),
  {
    closeLabel: 'Close dialog',
    closeOnBackdrop: true,
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const titleId = `mds-dialog-title-${Math.random().toString(36).substring(2, 9)}`;
const modalRef = ref<HTMLElement | null>(null);

function onClose() {
  emit('close');
}

function onBackdropClick() {
  if (props.closeOnBackdrop) {
    onClose();
  }
}

watch(
  () => props.isOpen,
  async (open) => {
    if (open) {
      await nextTick();
      modalRef.value?.focus();
    }
  }
);
</script>

<style scoped>
.mds-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--mds-space-4);
  background: rgba(7, 11, 20, 0.65);
  backdrop-filter: blur(8px);
}

.mds-modal-dialog {
  inline-size: 100%;
  max-inline-size: 540px;
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  box-shadow: 0 24px 48px rgba(7, 15, 36, 0.25);
  overflow: hidden;
  outline: none;
}

.mds-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: var(--mds-space-6);
  padding-block: var(--mds-space-4);
  border-block-end: 1px solid var(--mds-color-border-subtle);
}

.mds-modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  margin: 0;
}

.mds-modal-close-btn {
  min-inline-size: 40px;
  min-block-size: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--mds-radius-full);
  color: var(--mds-color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mds-modal-close-btn:hover {
  background: var(--mds-color-surface-elevated);
  color: var(--mds-color-text-primary);
}

.close-icon {
  inline-size: 20px;
  block-size: 20px;
}

.mds-modal-body {
  padding: var(--mds-space-6);
}

.mds-modal-footer {
  padding-inline: var(--mds-space-6);
  padding-block: var(--mds-space-4);
  background: var(--mds-color-surface-ground);
  border-block-start: 1px solid var(--mds-color-border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: var(--mds-space-3);
}

/* Transitions */
.mds-modal-fade-enter-active,
.mds-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.mds-modal-fade-enter-from,
.mds-modal-fade-leave-to {
  opacity: 0;
}
</style>
