import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { CourseSummary } from "../types";

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
};