import { ref, computed } from 'vue';
import { UserProgressResource, UserProgressModel } from './resources';
import { useAuthStore } from '@meridian/auth';

export function useMeridianUserLogs() {
  const authStore = useAuthStore();

  const progressRecords = ref<UserProgressModel[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  const completedActivitiesCount = computed(() =>
    progressRecords.value.filter((p) => p.completed || p.progress >= 0.99).length
  );

  const totalTimeSpentMinutes = computed(() =>
    Math.round(progressRecords.value.reduce((sum, p) => sum + (p.time_spent ?? 0), 0) / 60)
  );

  /**
   * Fetches progress records for content items.
   */
  async function fetchProgress(contentIds?: string[]): Promise<UserProgressModel[]> {
    if (!authStore.isAuthenticated) return [];

    isLoading.value = true;
    error.value = null;

    try {
      const params: Record<string, unknown> = {};
      if (contentIds && contentIds.length > 0) {
        params.content_ids = contentIds;
      }

      const response: any = await UserProgressResource.list(params);
      const items: UserProgressModel[] = Array.isArray(response) ? response : (response?.results ?? []);
      progressRecords.value = items;
      return items;
    } catch (err: any) {
      const formattedError = new Error('Failed to retrieve learning engagement logs.');
      error.value = formattedError;
      throw formattedError;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    progressRecords,
    completedActivitiesCount,
    totalTimeSpentMinutes,
    isLoading,
    error,
    fetchProgress,
  };
}
