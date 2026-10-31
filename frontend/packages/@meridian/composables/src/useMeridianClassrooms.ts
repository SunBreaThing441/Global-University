import { ref, computed } from 'vue';
import { ClassroomResource, ClassroomModel } from './resources';

export function useMeridianClassrooms() {
  const classrooms = ref<ClassroomModel[]>([]);
  const activeClassroomId = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const activeClassroom = computed(() =>
    classrooms.value.find((c) => c.id === activeClassroomId.value) ?? null
  );

  const totalLearnersCount = computed(() =>
    classrooms.value.reduce((sum, c) => sum + (c.learner_count ?? 0), 0)
  );

  /**
   * Fetches classrooms from Django ClassroomViewSet.
   */
  async function fetchClassrooms(): Promise<ClassroomModel[]> {
    isLoading.value = true;
    error.value = null;

    try {
      const response: any = await ClassroomResource.list();
      const items: ClassroomModel[] = Array.isArray(response) ? response : (response?.results ?? []);
      classrooms.value = items;

      if (items.length > 0 && !activeClassroomId.value) {
        activeClassroomId.value = items[0].id;
      }
      return items;
    } catch (err: any) {
      const formattedError = new Error(
        err?.response?.data?.detail || 'Failed to retrieve classroom networks.'
      );
      error.value = formattedError;
      throw formattedError;
    } finally {
      isLoading.value = false;
    }
  }

  function selectClassroom(id: string) {
    activeClassroomId.value = id;
  }

  return {
    classrooms,
    activeClassroomId,
    activeClassroom,
    totalLearnersCount,
    isLoading,
    error,
    fetchClassrooms,
    selectClassroom,
  };
}
