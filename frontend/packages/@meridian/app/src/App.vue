<template>
  <div class="meridian-app" :dir="textDirection">
    <MeridianAppBar />
    <main class="meridian-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { textDirection } from '@meridian/i18n';
import { MeridianAppBar } from '@meridian/components';
import { useAuthStore, ensureCsrfTokenPrimed } from '@meridian/auth';

const authStore = useAuthStore();

onMounted(async () => {
  await ensureCsrfTokenPrimed();
  await authStore.initSession();
});
</script>

<style>
@import '@meridian/design-tokens/src/index.css';

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background-color: var(--mds-color-surface-ground);
  color: var(--mds-color-text-primary);
  font-family: var(--mds-font-family-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

.meridian-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.meridian-main {
  flex: 1;
  padding-inline: var(--mds-space-6);
  padding-block: var(--mds-space-4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
