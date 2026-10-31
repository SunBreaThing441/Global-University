<template>
  <div class="dispatcher-loader" role="status">
    <span class="spinner" />
    <p>Navigating to your workspace...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@meridian/auth';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isAdmin) {
    router.replace({ name: 'AdminDashboard' });
  } else if (authStore.isCoach) {
    router.replace({ name: 'CoachDashboard' });
  } else {
    router.replace({ name: 'LearnerDashboard' });
  }
});
</script>

<style scoped>
.dispatcher-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-block-size: 60vh;
  gap: var(--mds-space-4);
  color: var(--mds-color-text-secondary);
}

.spinner {
  inline-size: 36px;
  block-size: 36px;
  border: 3px solid var(--mds-color-border-subtle);
  border-block-start-color: var(--mds-color-brand-secondary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
