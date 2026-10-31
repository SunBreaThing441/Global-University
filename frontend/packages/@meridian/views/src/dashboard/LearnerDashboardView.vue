<template>
  <div class="learner-dashboard">
    <!-- Header with UNESCO Planetary Greeting -->
    <header class="dashboard-header">
      <div class="header-text">
        <span class="unesco-tag">UNESCO SDG 4 • Global Learning Portal</span>
        <h1 class="welcome-title">Welcome back, {{ authStore.fullName || authStore.username }}</h1>
        <p class="welcome-subtitle">
          Your learning journey connects with {{ totalLearnersCount }} learners across your facility.
        </p>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="metric-strip">
        <div class="metric-card">
          <span class="metric-value">{{ completedActivitiesCount }}</span>
          <span class="metric-label">Completed Modules</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ totalTimeSpentMinutes }}m</span>
          <span class="metric-label">Engaged Learning</span>
        </div>
      </div>
    </header>

    <!-- Error Banner (When API is unreachable) -->
    <MeridianErrorBanner
      v-if="lessonsError"
      :message="lessonsError.message"
      @retry="loadData"
    />

    <!-- Classroom Filter Tabs -->
    <section v-if="classrooms.length > 1" class="classroom-tabs" aria-label="Classroom Filter">
      <button
        v-for="classroom in classrooms"
        :key="classroom.id"
        :class="['tab-btn', { 'tab-btn--active': activeClassroomId === classroom.id }]"
        @click="switchClassroom(classroom.id)"
      >
        {{ classroom.name }}
      </button>
    </section>

    <!-- Main Module Grid -->
    <section class="modules-section" aria-labelledby="sec-modules">
      <div class="section-header">
        <h2 id="sec-modules" class="section-title">Assigned Learning Modules</h2>
        <span v-if="!isLoadingLessons" class="count-pill">{{ activeLessonsCount }} Active</span>
      </div>

      <!-- Shimmer Loading Skeletons -->
      <div v-if="isLoadingLessons" class="cards-grid">
        <MeridianCardSkeleton v-for="n in 3" :key="n" />
      </div>

      <!-- Empty State -->
      <MeridianEmptyState
        v-else-if="lessons.length === 0"
        title="No Lessons Assigned"
        description="Your coach has not assigned any active educational modules for this classroom yet. Check back soon!"
      />

      <!-- Real Dynamic Lesson Cards -->
      <div v-else class="cards-grid">
        <MeridianLessonCard
          v-for="lesson in lessons"
          :key="lesson.id"
          :lesson="adaptLessonModel(lesson)"
          @select="openLesson"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@meridian/auth';
import { useMeridianLessons, useMeridianClassrooms, useMeridianUserLogs } from '@meridian/composables';
import {
  MeridianLessonCard,
  MeridianCardSkeleton,
  MeridianErrorBanner,
  MeridianEmptyState,
} from '@meridian/components';

const router = useRouter();
const authStore = useAuthStore();

const {
  lessons,
  isLoading: isLoadingLessons,
  error: lessonsError,
  activeLessonsCount,
  fetchLessons,
} = useMeridianLessons();

const {
  classrooms,
  activeClassroomId,
  totalLearnersCount,
  fetchClassrooms,
  selectClassroom,
} = useMeridianClassrooms();

const {
  completedActivitiesCount,
  totalTimeSpentMinutes,
  fetchProgress,
} = useMeridianUserLogs();

async function loadData() {
  await fetchClassrooms();
  await fetchLessons({ collection: activeClassroomId.value ?? undefined });
  const contentIds = lessons.value.flatMap((l) => l.resources?.map((r) => r.content_id) ?? []);
  if (contentIds.length > 0) {
    fetchProgress(contentIds);
  }
}

function switchClassroom(id: string) {
  selectClassroom(id);
  fetchLessons({ collection: id });
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

function openLesson(lessonId: string) {
  router.push(`/learn/lesson/${lessonId}`);
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.learner-dashboard {
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

.unesco-tag {
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

.metric-strip {
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

.metric-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--mds-color-brand-primary);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--mds-color-text-tertiary);
  margin-block-start: var(--mds-space-1);
}

.classroom-tabs {
  display: flex;
  gap: var(--mds-space-2);
  margin-block-end: var(--mds-space-6);
  overflow-x: auto;
}

.tab-btn {
  padding: var(--mds-space-2) var(--mds-space-4);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-full);
  background: var(--mds-color-surface-base);
  color: var(--mds-color-text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn--active {
  background: var(--mds-color-brand-primary);
  color: #FFFFFF;
  border-color: var(--mds-color-brand-primary);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: var(--mds-space-4);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--mds-color-text-primary);
  margin: 0;
}

.count-pill {
  padding: var(--mds-space-1) var(--mds-space-3);
  border-radius: var(--mds-radius-full);
  background: rgba(14, 116, 144, 0.1);
  color: var(--mds-color-brand-secondary);
  font-size: 0.75rem;
  font-weight: 700;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--mds-space-6);
}
</style>
