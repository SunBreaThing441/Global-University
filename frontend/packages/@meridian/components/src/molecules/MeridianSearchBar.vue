<template>
  <div class="mds-search-bar" role="search">
    <div class="search-input-wrap">
      <span class="search-icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
      </span>

      <input
        ref="inputRef"
        type="search"
        class="search-input"
        :value="modelValue"
        :placeholder="placeholder"
        :aria-label="ariaLabel || placeholder"
        @input="onInput"
        @keydown.esc="onClear"
      />

      <div class="search-actions">
        <button
          v-if="modelValue"
          type="button"
          class="clear-btn"
          aria-label="Clear search"
          @click="onClear"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <span v-else-if="showShortcutHint" class="shortcut-hint" aria-hidden="true">
          {{ isMac ? '⌘K' : 'Ctrl+K' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    ariaLabel?: string;
    debounceMs?: number;
    showShortcutHint?: boolean;
  }>(),
  {
    placeholder: 'Search modules, topics, or subjects...',
    ariaLabel: 'Search learning content',
    debounceMs: 250,
    showShortcutHint: true,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'search', value: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const val = target.value;

  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit('update:modelValue', val);
    emit('search', val);
  }, props.debounceMs);
}

function onClear() {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  emit('update:modelValue', '');
  emit('search', '');
  inputRef.value?.focus();
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    inputRef.value?.focus();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  if (debounceTimeout) clearTimeout(debounceTimeout);
});
</script>

<style scoped>
.mds-search-bar {
  inline-size: 100%;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-full);
  padding-inline: var(--mds-space-4);
  block-size: 44px;
  box-shadow: 0 2px 8px rgba(11, 37, 89, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input-wrap:focus-within {
  border-color: var(--mds-color-brand-secondary);
  box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
}

.search-icon {
  inline-size: 18px;
  block-size: 18px;
  color: var(--mds-color-text-tertiary);
  margin-inline-end: var(--mds-space-2);
  display: flex;
  align-items: center;
}

.search-icon svg {
  inline-size: 100%;
  block-size: 100%;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  color: var(--mds-color-text-primary);
  line-height: 1.5;
}

.search-input::placeholder {
  color: var(--mds-color-text-tertiary);
}

.search-actions {
  display: flex;
  align-items: center;
}

.clear-btn {
  inline-size: 28px;
  block-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--mds-radius-full);
  color: var(--mds-color-text-tertiary);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.clear-btn:hover {
  background: var(--mds-color-surface-elevated);
  color: var(--mds-color-text-primary);
}

.clear-btn svg {
  inline-size: 16px;
  block-size: 16px;
}

.shortcut-hint {
  font-size: 0.6875rem;
  font-weight: 700;
  padding-inline: var(--mds-space-2);
  padding-block: 2px;
  border-radius: var(--mds-radius-sm);
  background: var(--mds-color-surface-elevated);
  color: var(--mds-color-text-tertiary);
  border: 1px solid var(--mds-color-border-subtle);
  user-select: none;
}
</style>
