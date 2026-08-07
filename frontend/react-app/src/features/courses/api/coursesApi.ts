import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { CourseDetail, CourseSummary } from "../types";

export const coursesApi = {
  /**
   * Works for both authenticated (personalized) and anonymous (random)
   * visitors — apiClient only attaches an Authorization header if a token
   * exists, so no special handling needed here either way.
   */
  fetchMyFeed: async (): Promise<CourseSummary[]> => {
    const { data } = await apiClient.get<ApiEnvelope<CourseSummary[]>>("/courses/my-feed");
    return data.data;
  },

  /** GET /api/courses/course-detail/<uuid:pk> — takes the course's UUID, not its slug. */
  fetchCourseDetail: async (courseId: string): Promise<CourseDetail> => {
    const { data } = await apiClient.get<ApiEnvelope<CourseDetail>>(
      `/courses/course-detail/${courseId}`,
    );
    return data.data;
  },
};