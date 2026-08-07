import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";

// Response shape not confirmed against a real payload yet — treated as
// unknown and only used for its envelope message on the toast for now.
export const enrollmentsApi = {
  /** POST /api/enrollments/enrollment-create — for FREE and MONTHLY (subscription-gated) courses. */
  enrollInCourse: async (courseId: string): Promise<string> => {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>("/enrollments/enrollment-create", {
      course: courseId,
    });
    return data.message;
  },
};