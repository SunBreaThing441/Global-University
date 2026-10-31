<template>
  <div class="coach-dashboard">
    <header class="dashboard-header">
      <div class="header-text">
        <span class="role-tag">Facility / Class Coach Console</span>
        <h1 class="welcome-title">Educational Operations & Classroom Oversight</h1>
        <p class="welcome-subtitle">
          Manage curricula, monitor student mastery, and oversee assigned classroom groups.
        </p>
      </div>

      <div class="metrics-strip">
        <div class="metric-card">
          <span class="metric-val">{{ classrooms.length }}</span>
          <span class="metric-lbl">Assigned Classrooms</span>
        </div>
        <div class="metric-card">
          <span class="metric-val">{{ totalLessonsCount }}</span>
          <span class="metric-lbl">Total Modules</span>
        </div>
        <div class="metric-card">
          <span class="metric-val">{{ activeLessonsCount }}</span>
          <span class="metric-lbl">Active Curricula</span>
        </div>
      </div>
    </header>

    <!-- Error Banner -->
    <MeridianErrorBanner
      v-if="lessonsError"
      :message="lessonsError.message"
      @retry="loadCoachData"
    />

    <!-- Classroom Selection Bar -->
    <div class="controls-bar">
      <div class="classrooms-picker">
        <label for="classroom-select" class="picker-label">Select Classroom:</label>
        <select
          id="classroom-select"
          v-model="selectedClassroomId"
          class="mds-select"
          @change="onClassroomChanged"
        >
          <option v-for="c in classrooms" :key="c.id" :value="c.id">
            {{ c.name }} ({{ c.learner_count ?? 0 }} learners)
          </option>
        </select>
      </div>

      <div class="search-wrap">
        <MeridianSearchBar
          v-model="searchQuery"
          placeholder="Filter classroom lessons..."
          @search="onSearch"
        />
      </div>
    </div>

    <!-- Lessons Table / Cards -->
    <section class="lessons-management" aria-labelledby="sec-mgmt">
      <div class="section-header">
        <h2 id="sec-mgmt" class="section-title">Classroom Lesson Assignments</h2>
        <span class="status-summary">{{ activeLessonsCount }} of {{ totalLessonsCount }} modules active</span>
      </div>

      <!-- Shimmer Loading -->
      <div v-if="isLoadingLessons" class="cards-grid">
        <MeridianCardSkeleton v-for="n in 3" :key="n" />
      </div>

      <!-- Empty State -->
      <MeridianEmptyState
        v-else-if="lessons.length === 0"
        title="No Lessons Found"
        description="There are no learning modules assigned to this classroom matching your search criteria."
      />

      <!-- Dynamic Cards -->
      <div v-else class="cards-grid">
        <div v-for="lesson in lessons" :key="lesson.id" class="coach-lesson-card">
          <MeridianLessonCard
            :lesson="adaptLessonModel(lesson)"
            @select="onInspectLesson"
          />
          <div class="coach-card-controls">
            <span class="status-text" :class="{ 'status-text--active': lesson.active }">
              {{ lesson.active ? 'Active for Learners' : 'Draft / Inactive' }}
            </span>
            <button
              type="button"
              class="toggle-btn"
              :class="{ 'toggle-btn--active': lesson.active }"
              @click="toggleActive(lesson.id, !lesson.active)"
            >
              {{ lesson.active ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMeridianLessons, useMeridianClassrooms } from '@meridian/composables';
import {
  MeridianLessonCard,
  MeridianCardSkeleton,
  MeridianSearchBar,
  MeridianErrorBanner,
  MeridianEmptyState,
} from '@meridian/components';

const router = useRouter();

const {
  lessons,
  isLoading: isLoadingLessons,
  error: lessonsError,
  totalLessonsCount,
  activeLessonsCount,
  fetchLessons,
  toggleLessonActive,
} = useMeridianLessons();

const {
  classrooms,
  activeClassroomId,
  fetchClassrooms,
  selectClassroom,
} = useMeridianClassrooms();

const selectedClassroomId = ref<string>('');
const searchQuery = ref<string>('');

async function loadCoachData() {
  await fetchClassrooms();
  if (activeClassroomId.value) {
    selectedClassroomId.value = activeClassroomId.value;
    await fetchLessons({ collection: activeClassroomId.value });
  } else {
    await fetchLessons();
  }
}

function onClassroomChanged() {
  selectClassroom(selectedClassroomId.value);
  fetchLessons({
    collection: selectedClassroomId.value,
    search: searchQuery.value,
  });
}

function onSearch(query: string) {
  fetchLessons({
    collection: selectedClassroomId.value || undefined,
    search: query,
  });
}

async function toggleActive(lessonId: string, newState: boolean) {
  await toggleLessonActive(lessonId, newState);
}

function adaptLessonModel(lesson: any) {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    resources_count: lesson.resources?.length ?? 0,
    is_unesco_heritage: true,
    progress: {
      num_completed: 0,
      total: lesson.resources?.length ?? 1,
    },
  };
}

function onInspectLesson(id: string) {
  router.push(`/coach/lessons/${id}`);
}

onMounted(() => {
  loadCoachData();
});
</script>

<style scoped>
.coach-dashboard {
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

.role-tag {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--mds-color-brand-secondary);
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

.metrics-strip {
  display: flex;
  gap: var(--mds-space-4);
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--mds-space-4) var(--mds-space-6);
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-md);
  min-inline-size: 120px;
}

.metric-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--mds-color-brand-secondary);
}

.metric-lbl {
  font-size: 0.75rem;
  color: var(--mds-color-text-tertiary);
  margin-block-start: var(--mds-space-1);
}

.controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mds-space-4);
  flex-wrap: wrap;
  margin-block-end: var(--mds-space-6);
  padding: var(--mds-space-4);
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-md);
}

.classrooms-picker {
  display: flex;
  align-items: center;
  gap: var(--mds-space-3);
}

.picker-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mds-color-text-secondary);
}

.mds-select {
  padding-inline: var(--mds-space-3);
  padding-block: var(--mds-space-2);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-md);
  background: var(--mds-color-surface-ground);
  color: var(--mds-color-text-primary);
  font-size: 0.875rem;
  font-weight: 600;
  outline: none;
}

.search-wrap {
  flex: 1;
  max-inline-size: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-block-end: var(--mds-space-4);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  margin: 0;
}

.status-summary {
  font-size: 0.8125rem;
  color: var(--mds-color-text-secondary);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--mds-space-6);
}

.coach-lesson-card {
  display: flex;
  flex-direction: column;
}

.coach-card-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mds-space-3) var(--mds-space-4);
  background: var(--mds-color-surface-elevated);
  border: 1px solid var(--mds-color-border-subtle);
  border-block-start: none;
  border-radius: 0 0 var(--mds-radius-lg) var(--mds-radius-lg);
}

.status-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--mds-color-text-tertiary);
}

.status-text--active {
  color: var(--mds-color-status-success);
}

.toggle-btn {
  padding-inline: var(--mds-space-3);
  padding-block: var(--mds-space-1);
  border-radius: var(--mds-radius-sm);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--mds-color-border-subtle);
  background: var(--mds-color-surface-base);
  color: var(--mds-color-text-primary);
  transition: all 0.15s ease;
}

.toggle-btn--active {
  background: rgba(220, 38, 38, 0.1);
  color: var(--mds-color-status-error);
  border-color: rgba(220, 38, 38, 0.2);
}
</style>
