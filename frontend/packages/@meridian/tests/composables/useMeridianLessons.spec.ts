import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMeridianLessons } from '@meridian/composables/useMeridianLessons';
import { LessonResource } from '@meridian/composables/resources';

describe('useMeridianLessons composable', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockLessonData = [
    {
      id: 'lesson-1',
      title: 'Oceanography Basics',
      description: 'Marine ecosystems and ocean currents',
      active: true,
      resources: [],
      collection: 'class-1',
      assignments: [],
      learner_ids: [],
      created_by: 'coach-1',
      date_created: '2026-01-01',
    },
    {
      id: 'lesson-2',
      title: 'Atmospheric Physics',
      description: 'Climate indicators and weather patterns',
      active: false,
      resources: [],
      collection: 'class-1',
      assignments: [],
      learner_ids: [],
      created_by: 'coach-1',
      date_created: '2026-01-02',
    },
  ];

  it('fetches and filters active lessons only when requested', async () => {
    vi.spyOn(LessonResource, 'list').mockResolvedValue(mockLessonData as any);

    const { lessons, activeLessonsCount, fetchLessons } = useMeridianLessons();

    const result = await fetchLessons({ activeOnly: true });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('lesson-1');
    expect(lessons.value).toHaveLength(1);
    expect(activeLessonsCount.value).toBe(1);
  });

  it('filters lessons matching search query case-insensitively', async () => {
    vi.spyOn(LessonResource, 'list').mockResolvedValue(mockLessonData as any);

    const { fetchLessons } = useMeridianLessons();

    const result = await fetchLessons({ search: 'physics' });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('lesson-2');
  });
});
