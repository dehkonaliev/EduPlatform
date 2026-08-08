import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { EnrollmentStatus, MyEnrollment } from "../types";

export const enrollmentsApi = {
  /** POST /api/enrollments/enrollment-create — for FREE and MONTHLY (subscription-gated) courses. */
  enrollInCourse: async (courseId: string): Promise<string> => {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>("/enrollments/enrollment-create", {
      course: courseId,
    });
    return data.message;
  },

  /**
   * GET /api/enrollments/my-enrollments — passes ?status= when a tab is
   * selected so the backend filters; omitting it returns every status.
   */
  fetchMyEnrollments: async (status?: EnrollmentStatus): Promise<MyEnrollment[]> => {
    const { data } = await apiClient.get<ApiEnvelope<MyEnrollment[]>>(
      "/enrollments/my-enrollments",
      { params: status ? { status } : undefined },
    );
    return data.data;
  },

  /** PATCH /api/enrollments/enrollment-drop/<uuid:pk> — drops the enrollment
   * (only allowed from ACTIVE/DEACTIVATED). Resolves with the backend message. */
  dropEnrollment: async (enrollmentId: string): Promise<string> => {
    const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
      `/enrollments/enrollment-drop/${enrollmentId}`,
    );
    return data.message;
  },
};