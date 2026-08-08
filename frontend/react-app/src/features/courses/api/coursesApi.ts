import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type {
  CategorySummary,
  CourseDetail,
  CourseSearchParams,
  CourseSummary,
  InstructorSummary,
  PaginatedCourseResponse,
  TagSummary,
} from "../types";

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

  /** GET /api/courses/filtered-courses — returns DRF pagination directly
   * (no success/data envelope): { count, next, previous, results }. */
  searchCourses: async (
    params: CourseSearchParams,
    page = 1,
  ): Promise<PaginatedCourseResponse> => {
    const { data } = await apiClient.get<PaginatedCourseResponse>(
      "/courses/filtered-courses",
      { params: { ...params, page } },
    );
    return data;
  },

  /** GET /api/courses/categories — filter options for the search page. */
  fetchCategories: async (): Promise<CategorySummary[]> => {
    const { data } = await apiClient.get<ApiEnvelope<CategorySummary[]>>("/courses/categories");
    return data.data;
  },

  /** GET /api/courses/tags — filter options for the search page. */
  fetchTags: async (): Promise<TagSummary[]> => {
    const { data } = await apiClient.get<ApiEnvelope<TagSummary[]>>("/courses/tags");
    return data.data;
  },

  /** GET /api/courses/instructors — filter options for the search page. */
  fetchInstructors: async (): Promise<InstructorSummary[]> => {
    const { data } = await apiClient.get<ApiEnvelope<InstructorSummary[]>>("/courses/instructors");
    return data.data;
  },
};