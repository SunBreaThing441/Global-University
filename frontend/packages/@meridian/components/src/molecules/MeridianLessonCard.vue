<template>
  <div class="meridian-card-container">
    <article
      class="lesson-card"
      :class="{
        'lesson-card--completed': isCompleted,
        'lesson-card--in-progress': isInProgress,
        'lesson-card--has-due-date': !!lesson?.due_date,
      }"
      tabindex="0"
      role="region"
      :aria-labelledby="`lesson-title-${lesson?.id}`"
      @keydown.enter="onSelect"
    >
      <!-- Card Media Header with Aspect Ratio & Badges -->
      <div class="lesson-card__media">
        <img
          v-if="lesson?.thumbnail"
          :src="lesson.thumbnail"
          :alt="lesson?.title ?? t('untitled')"
          class="lesson-card__image"
          loading="lazy"
        />
        <div v-else class="lesson-card__placeholder">
          <!-- UNESCO Planetary Monogram -->
          <svg class="lesson-card__glyph" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="1.5" />
            <ellipse cx="16" cy="16" rx="6" ry="14" stroke="currentColor" stroke-width="1.2" />
            <line x1="2" y1="16" x2="30" y2="16" stroke="currentColor" stroke-width="1.2" />
          </svg>
        </div>

        <!-- Floating Category & UNESCO Impact Badge -->
        <div class="lesson-card__badges">
          <span class="badge badge--category">
            {{ lesson?.category ?? t('openEducation') }}
          </span>
          <span v-if="lesson?.is_unesco_heritage" class="badge badge--unesco">
            UNESCO SDG 4
          </span>
        </div>

        <!-- Bookmark / Save Button -->
        <button
          type="button"
          class="lesson-card__bookmark-btn"
          :aria-label="isBookmarked ? t('removeBookmark') : t('addBookmark')"
          :aria-pressed="isBookmarked"
          @click.stop="toggleBookmark"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" class="bookmark-icon" aria-hidden="true">
            <path
              v-if="isBookmarked"
              d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
            />
            <path
              v-else
              d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
            />
          </svg>
        </button>
      </div>

      <!-- Card Core Content -->
      <div class="lesson-card__content">
        <!-- Metadata Header: Resource Count & Due Status -->
        <div class="lesson-card__meta">
          <span class="meta-item">
            <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            {{ t('resourcesCount', { count: lesson?.resources_count ?? lesson?.num_coach_contents ?? 0 }) }}
          </span>

          <span v-if="dueStatusText" class="meta-item meta-item--due" :class="`due--${dueSeverity}`">
            <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            {{ dueStatusText }}
          </span>
        </div>

        <!-- Lesson Title (with unrestricted modern optional chaining) -->
        <h3 :id="`lesson-title-${lesson?.id}`" class="lesson-card__title">
          {{ lesson?.title ?? t('untitled') }}
        </h3>

        <!-- Lesson Description -->
        <p class="lesson-card__description">
          {{ lesson?.description ?? t('noDescription') }}
        </p>

        <!-- Dynamic Progress Mastery Ring & Status Bar -->
        <div class="lesson-card__progress-section">
          <div class="progress-info">
            <span class="progress-label">
              {{ isCompleted ? t('completed') : t('progressPercent', { percent: progressPercentage }) }}
            </span>
            <span class="progress-sublabel">
              {{ t('completedCount', { completed: lesson?.progress?.num_completed ?? 0, total: lesson?.resources_count ?? 1 }) }}
            </span>
          </div>

          <div
            class="progress-bar-track"
            role="progressbar"
            :aria-valuenow="progressPercentage"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="t('progressLabel')"
          >
            <div
              class="progress-bar-fill"
              :style="{ inlineSize: `${progressPercentage}%` }"
            />
          </div>
        </div>

        <!-- Interactive Action Footer -->
        <footer class="lesson-card__footer">
          <MeridianButton
            :variant="isCompleted ? 'secondary' : 'primary'"
            size="md"
            class="lesson-card__cta"
            @click.stop="onSelect"
          >
            {{ isCompleted ? t('reviewLesson') : isInProgress ? t('continueLesson') : t('startLesson') }}
            <template #iconEnd>
              <!-- Navigational Arrow (Auto-mirrored in RTL) -->
              <svg class="nav-arrow mds-icon--navigational" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </template>
          </MeridianButton>
        </footer>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMeridianTranslator } from '@meridian/i18n';
import MeridianButton from '../primitives/MeridianButton.vue';

export interface LessonProgress {
  status?: 'not_started' | 'in_progress' | 'completed';
  num_completed?: number;
  total?: number;
}

export interface LessonModel {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  is_unesco_heritage?: boolean;
  resources_count?: number;
  num_coach_contents?: number;
  due_date?: string | null;
  progress?: LessonProgress;
  is_bookmarked?: boolean;
}

const props = defineProps<{
  lesson: LessonModel;
}>();

const emit = defineEmits<{
  (e: 'select', lessonId: string): void;
  (e: 'bookmark', lessonId: string, bookmarked: boolean): void;
}>();

// --- Localization ---
const { t } = useMeridianTranslator('LessonCard', {
  untitled: { message: 'Untitled Lesson', context: 'Fallback title' },
  noDescription: { message: 'No overview provided for this educational module.', context: 'Fallback description' },
  openEducation: { message: 'Global Curriculum', context: 'Default topic tag' },
  resourcesCount: { message: '{count} learning activities', context: 'Resource tally' },
  startLesson: { message: 'Start Learning', context: 'CTA button' },
  continueLesson: { message: 'Resume Activity', context: 'CTA button' },
  reviewLesson: { message: 'Review Module', context: 'CTA button' },
  completed: { message: '100% Mastery Achieved', context: 'Status text' },
  progressPercent: { message: '{percent}% completed', context: 'Progress label' },
  completedCount: { message: '{completed} of {total} activities done', context: 'Progress ratio' },
  progressLabel: { message: 'Lesson mastery progress', context: 'Accessibility label' },
  addBookmark: { message: 'Bookmark for offline study', context: 'Aria label' },
  removeBookmark: { message: 'Remove bookmark', context: 'Aria label' },
  dueToday: { message: 'Due Today', context: 'Urgency badge' },
  dueInDays: { message: 'Due in {days} days', context: 'Countdown badge' },
  overdue: { message: 'Past Due', context: 'Warning badge' },
});

// --- Reactive State & Computeds ---
const isBookmarked = ref(props.lesson?.is_bookmarked ?? false);

const progressPercentage = computed<number>(() => {
  const completed = props.lesson?.progress?.num_completed ?? 0;
  const total = props.lesson?.resources_count ?? props.lesson?.num_coach_contents ?? 1;
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
});

const isCompleted = computed(() => progressPercentage.value >= 100);
const isInProgress = computed(() => progressPercentage.value > 0 && progressPercentage.value < 100);

const dueSeverity = computed<'normal' | 'urgent' | 'overdue'>(() => {
  if (!props.lesson?.due_date) return 'normal';
  const diffDays = Math.ceil((new Date(props.lesson.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 2) return 'urgent';
  return 'normal';
});

const dueStatusText = computed<string | null>(() => {
  if (!props.lesson?.due_date) return null;
  const diffDays = Math.ceil((new Date(props.lesson.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return t('overdue');
  if (diffDays === 0) return t('dueToday');
  return t('dueInDays', { days: diffDays });
});

function onSelect() {
  emit('select', props.lesson.id);
}

function toggleBookmark() {
  isBookmarked.value = !isBookmarked.value;
  emit('bookmark', props.lesson.id, isBookmarked.value);
}
</script>

<style scoped>
/* Container Query for Adaptive Fluid Geometry */
.meridian-card-container {
  container-type: inline-size;
  container-name: lesson-card;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  background: var(--mds-color-surface-base);
  border: 1px solid var(--mds-color-border-subtle);
  border-radius: var(--mds-radius-lg);
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  outline: none;
}

.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(11, 37, 89, 0.09);
  border-color: var(--mds-color-brand-secondary);
}

.lesson-card:focus-visible {
  box-shadow: 0 0 0 3px var(--mds-color-surface-base), 0 0 0 6px var(--mds-color-brand-secondary);
}

/* Card Media Section */
.lesson-card__media {
  position: relative;
  inline-size: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, var(--mds-color-surface-elevated), var(--mds-color-surface-ground));
  display: flex;
  align-items: center;
  justify-content: center;
}

.lesson-card__image {
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
}

.lesson-card__placeholder {
  color: var(--mds-color-brand-secondary);
  opacity: 0.7;
}

.lesson-card__glyph {
  inline-size: 48px;
  block-size: 48px;
}

/* Floating Badges */
.lesson-card__badges {
  position: absolute;
  inset-block-start: var(--mds-space-3);
  inset-inline-start: var(--mds-space-3);
  display: flex;
  flex-wrap: wrap;
  gap: var(--mds-space-2);
}

.badge {
  padding-inline: var(--mds-space-2);
  padding-block: var(--mds-space-1);
  border-radius: var(--mds-radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  backdrop-filter: blur(8px);
}

.badge--category {
  background: var(--mds-color-surface-glass);
  color: var(--mds-color-text-primary);
  border: 1px solid var(--mds-color-surface-glass-border);
}

.badge--unesco {
  background: rgba(217, 119, 6, 0.15);
  color: var(--mds-color-brand-accent);
  border: 1px solid rgba(217, 119, 6, 0.3);
}

/* Bookmark Button (44px Accessible Target) */
.lesson-card__bookmark-btn {
  position: absolute;
  inset-block-start: var(--mds-space-2);
  inset-inline-end: var(--mds-space-2);
  min-inline-size: 44px;
  min-block-size: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--mds-color-surface-glass);
  border: 1px solid var(--mds-color-surface-glass-border);
  border-radius: var(--mds-radius-full);
  color: var(--mds-color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.lesson-card__bookmark-btn:hover {
  color: var(--mds-color-brand-accent);
  transform: scale(1.08);
}

.bookmark-icon {
  inline-size: 20px;
  block-size: 20px;
}

/* Core Content Body */
.lesson-card__content {
  padding: var(--mds-space-4);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.lesson-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mds-space-3);
  margin-block-end: var(--mds-space-2);
  font-size: 0.8125rem;
  color: var(--mds-color-text-tertiary);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: var(--mds-space-1);
}

.meta-icon {
  inline-size: 14px;
  block-size: 14px;
}

.due--urgent {
  color: var(--mds-color-status-warning);
  font-weight: 600;
}

.due--overdue {
  color: var(--mds-color-status-error);
  font-weight: 700;
}

.lesson-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--mds-color-text-primary);
  margin-block: 0 var(--mds-space-2);
}

.lesson-card__description {
  font-size: 0.875rem;
  color: var(--mds-color-text-secondary);
  line-height: 1.5;
  margin-block: 0 var(--mds-space-4);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Progress Bar */
.lesson-card__progress-section {
  margin-block-end: var(--mds-space-4);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-block-end: var(--mds-space-1);
  font-size: 0.75rem;
}

.progress-label {
  font-weight: 700;
  color: var(--mds-color-text-primary);
}

.progress-sublabel {
  color: var(--mds-color-text-tertiary);
}

.progress-bar-track {
  block-size: 6px;
  inline-size: 100%;
  background: var(--mds-color-surface-elevated);
  border-radius: var(--mds-radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  block-size: 100%;
  background: linear-gradient(90deg, var(--mds-color-brand-primary), var(--mds-color-brand-secondary));
  border-radius: var(--mds-radius-full);
  transition: inline-size 0.4s ease;
}

.lesson-card--completed .progress-bar-fill {
  background: var(--mds-color-status-success);
}

.lesson-card__footer {
  margin-block-start: auto;
}

.lesson-card__cta {
  inline-size: 100%;
}

.nav-arrow {
  inline-size: 18px;
  block-size: 18px;
}

/* --- Container Query Geometry --- */
@container lesson-card (inline-size > 480px) {
  .lesson-card {
    flex-direction: row;
  }

  .lesson-card__media {
    inline-size: 210px;
    aspect-ratio: auto;
  }

  .lesson-card__content {
    padding: var(--mds-space-5);
  }

  .lesson-card__cta {
    inline-size: auto;
  }
}
</style>
