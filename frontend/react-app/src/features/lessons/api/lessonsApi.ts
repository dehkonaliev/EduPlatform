import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { CompleteLessonResult, LessonDetail } from "../types";

export const lessonsApi = {
  /** GET /api/courses/lesson-detail/<uuid:pk> — returns the lesson plus the
   * full course curriculum for the sidebar navigation. Requires an active
   * enrollment for non-preview lessons. */
  fetchLessonDetail: async (lessonId: string): Promise<LessonDetail> => {
    const { data } = await apiClient.get<ApiEnvelope<LessonDetail>>(
      `/courses/lesson-detail/${lessonId}`,
    );
    return data.data;
  },

  /** POST /api/enrollments/lesson-progress/<uuid:pk> — marks the student's
   * progress record for the current lesson as completed. The backend unlocks
   * the next lesson (creating its LessonProgress record) and returns it. */
  completeLesson: async (progressId: string): Promise<CompleteLessonResult> => {
    const { data } = await apiClient.post<ApiEnvelope<CompleteLessonResult>>(
      `/enrollments/lesson-progress/${progressId}`,
    );
    return data.data;
  },
};
