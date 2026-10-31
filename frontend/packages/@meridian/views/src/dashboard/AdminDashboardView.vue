<template>
  <div class="admin-dashboard">
    <header class="dashboard-header">
      <div class="header-text">
        <span class="admin-tag">Facility Administration & Operations</span>
        <h1 class="welcome-title">Facility Administration Console</h1>
        <p class="welcome-subtitle">
          Manage local server infrastructure, Morango peer sync topologies, and facility users.
        </p>
      </div>

      <div class="header-actions">
        <button type="button" class="mds-button mds-button--primary" @click="triggerMeshSync">
          Synchronize Facility Network
        </button>
      </div>
    </header>

    <!-- Stat Cards -->
    <section class="stats-overview" aria-label="Facility Metrics">
      <div class="stat-card">
        <span class="stat-number">{{ classrooms.length }}</span>
        <span class="stat-title">Managed Classrooms</span>
        <span class="stat-sub">Active in this facility</span>
      </div>

      <div class="stat-card">
        <span class="stat-number">{{ totalLearnersCount }}</span>
        <span class="stat-title">Enrolled Learners</span>
        <span class="stat-sub">Across all classrooms</span>
      </div>

      <div class="stat-card">
        <span class="stat-number">P2P Mesh</span>
        <span class="stat-title">Morango Engine</span>
        <span class="stat-sub">Online & Ready</span>
      </div>

      <div class="stat-card">
        <span class="stat-number">SDG 4</span>
        <span class="stat-title">Global Education</span>
        <span class="stat-sub">UNESCO Certified</span>
      </div>
    </section>

    <!-- Facility Overview Card -->
    <div class="admin-grid">
      <section class="admin-card" aria-labelledby="sec-topology">
        <h2 id="sec-topology" class="card-heading">Synchronization Topology</h2>
        <div class="sync-info-box">
          <div class="sync-row">
            <span class="sync-label">Sync Protocol</span>
            <span class="sync-val">Morango P2P Mesh v0.7</span>
          </div>
          <div class="sync-row">
            <span class="sync-label">Storage Backend</span>
            <span class="sync-val">SQLite (Local Server)</span>
          </div>
          <div class="sync-row">
            <span class="sync-label">Local Facility ID</span>
            <span class="sync-val mono">{{ authStore.facilityId || 'Default Facility' }}</span>
          </div>
          <div class="sync-row">
            <span class="sync-label">Device Content Role</span>
            <span class="sync-val">{{ authStore.canManageContent ? 'Hub Authority' : 'Leaf Node' }}</span>
          </div>
        </div>
      </section>

      <section class="admin-card" aria-labelledby="sec-classes">
        <h2 id="sec-classes" class="card-heading">Classroom Networks</h2>
        <ul class="classroom-roster">
          <li v-for="c in classrooms" :key="c.id" class="roster-item">
            <div class="item-info">
              <span class="item-name">{{ c.name }}</span>
              <span class="item-coaches">
                Coaches: {{ c.coaches?.map(coach => coach.full_name || coach.username).join(', ') || 'Unassigned' }}
              </span>
            </div>
            <span class="item-count">{{ c.learner_count ?? 0 }} learners</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@meridian/auth';
import { useMeridianClassrooms } from '@meridian/composables';

const authStore = useAuthStore();
const { classrooms, totalLearnersCount, fetchClassrooms } = useMeridianClassrooms();

function triggerMeshSync() {
  alert('Initiating Morango background sync transfer across peer network.');
}

onMounted(() => {
  fetchClassrooms();
});
</script>

<style scoped>
.admin-dashboard {
  max-inline-size: 1280px;
  margin-inline: auto;
  padding-block: var(--mds-space-6);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--mds-space-6);
  padding: var(--mds-space-8);
  background: linear-gradient(135deg, var(--mds-color-surface-base), var(--mds-color-surface-elevated));
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  margin-block-end: var(--mds-space-8);
}

.admin-tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--mds-color-status-error);
  text-transform: uppercase;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--mds-color-text-primary);
  margin: var(--mds-space-1) 0;
}

.welcome-subtitle {
  color: var(--mds-color-text-secondary);
  font-size: 0.9375rem;
  margin: 0;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--mds-space-6);
  margin-block-end: var(--mds-space-8);
}

.stat-card {
  display: flex;
  flex-direction: column;
  padding: var(--mds-space-6);
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--mds-color-brand-primary);
  line-height: 1;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  margin-block-start: var(--mds-space-2);
}

.stat-sub {
  font-size: 0.75rem;
  color: var(--mds-color-text-tertiary);
  margin-block-start: var(--mds-space-1);
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: var(--mds-space-6);
}

.admin-card {
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  padding: var(--mds-space-6);
}

.card-heading {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  margin-block: 0 var(--mds-space-4);
  padding-block-end: var(--mds-space-3);
  border-block-end: 1px solid var(--mds-color-border-subtle);
}

.sync-info-box {
  display: flex;
  flex-direction: column;
  gap: var(--mds-space-3);
}

.sync-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  padding-block: var(--mds-space-2);
  border-block-end: 1px dashed var(--mds-color-border-subtle);
}

.sync-label {
  color: var(--mds-color-text-secondary);
}

.sync-val {
  font-weight: 600;
  color: var(--mds-color-text-primary);
}

.mono {
  font-family: monospace;
  font-size: 0.8125rem;
}

.classroom-roster {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--mds-space-3);
}

.roster-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mds-space-3);
  background: var(--mds-color-surface-ground);
  border-radius: var(--mds-radius-md);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-name {
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--mds-color-text-primary);
}

.item-coaches {
  font-size: 0.75rem;
  color: var(--mds-color-text-tertiary);
}

.item-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mds-color-brand-secondary);
  background: rgba(14, 116, 144, 0.1);
  padding: var(--mds-space-1) var(--mds-space-2);
  border-radius: var(--mds-radius-full);
}

.mds-button {
  padding-inline: var(--mds-space-5);
  padding-block: var(--mds-space-3);
  border-radius: var(--mds-radius-md);
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
  background: var(--mds-color-brand-primary);
  color: #FFFFFF;
  transition: opacity 0.2s ease;
}

.mds-button:hover {
  opacity: 0.9;
}
</style>
