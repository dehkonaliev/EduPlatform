import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { InstructorProfile, StudentProfile, UpdateStudentProfilePayload } from "../types";

export const profileApi = {
  fetchStudentProfile: async (): Promise<StudentProfile> => {
    const { data } = await apiClient.get<ApiEnvelope<StudentProfile>>("/profile/student-profile");
    return data.data;
  },

  fetchInstructorProfile: async (): Promise<InstructorProfile> => {
    const { data } = await apiClient.get<ApiEnvelope<InstructorProfile>>("/profile/instructor-profile");
    return data.data;
  },

  /** Only gender, bio, is_visible are writable — the rest are read_only on the backend. */
  updateStudentProfile: async (payload: UpdateStudentProfilePayload): Promise<StudentProfile> => {
    const { data } = await apiClient.patch<ApiEnvelope<StudentProfile>>(
      "/profile/student-profile",
      payload,
    );
    return data.data;
  },
};