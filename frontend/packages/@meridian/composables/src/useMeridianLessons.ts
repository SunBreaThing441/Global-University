import { ref, computed } from 'vue';
import { LessonResource, LessonModel } from './resources';

export interface FetchLessonsFilter {
  collection?: string; // Classroom ID
  search?: string;
  activeOnly?: boolean;
}

export function useMeridianLessons() {
  const lessons = ref<LessonModel[]>([]);
  const currentLesson = ref<LessonModel | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  // Computed Summaries for UNESCO Metric Displays
  const totalLessonsCount = computed(() => lessons.value.length);
  const activeLessons = computed(() => lessons.value.filter((l) => l.active));
  const activeLessonsCount = computed(() => activeLessons.value.length);

  /**
   * Fetches lessons accessible to the user, respecting backend KolibriAuthPermissions.
   */
  async function fetchLessons(filter: FetchLessonsFilter = {}): Promise<LessonModel[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const params: Record<string, unknown> = {};

      if (filter.collection) {
        params.collection = filter.collection;
      }

      // Backend ValuesViewset returns array directly or paginated envelope
      const response: any = await LessonResource.list(params);
      const items: LessonModel[] = Array.isArray(response) ? response : (response?.results ?? []);

      let filtered = items;
      if (filter.activeOnly) {
        filtered = filtered.filter((l) => l.active);
      }
      if (filter.search && filter.search.trim()) {
        const query = filter.search.toLowerCase();
        filtered = filtered.filter(
          (l) => l.title?.toLowerCase().includes(query) || l.description?.toLowerCase().includes(query)
        );
      }

      lessons.value = filtered;
      return filtered;
    } catch (err: any) {
      const formattedError = new Error(
        err?.response?.data?.detail || err?.message || 'Failed to retrieve educational modules.'
      );
      error.value = formattedError;
      throw formattedError;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetches a single lesson by ID with complete resource assignments.
   */
  async function fetchLessonById(id: string): Promise<LessonModel> {
    isLoading.value = true;
    error.value = null;

    try {
      const lesson = await LessonResource.retrieve(id);
      currentLesson.value = lesson;
      return lesson;
    } catch (err: any) {
      const formattedError = new Error(
        err?.response?.data?.detail || 'The requested module could not be found.'
      );
      error.value = formattedError;
      throw formattedError;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Coaches/Admins: Toggles a lesson active status in the database.
   */
  async function toggleLessonActive(id: string, activeState: boolean): Promise<LessonModel> {
    const existing = lessons.value.find((l) => l.id === id);
    const updated = await LessonResource.update(id, { active: activeState }, existing);

    // Optimistic reactive update
    const index = lessons.value.findIndex((l) => l.id === id);
    if (index !== -1) {
      lessons.value[index] = { ...lessons.value[index], active: activeState };
    }
    return updated;
  }

  return {
    lessons,
    currentLesson,
    isLoading,
    error,
    totalLessonsCount,
    activeLessons,
    activeLessonsCount,
    fetchLessons,
    fetchLessonById,
    toggleLessonActive,
  };
}
