import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type {
  CategorySummary,
  CourseCreatePayload,
  CourseCreateResponse,
  CourseDetail,
  CourseSearchParams,
  CourseSummary,
  InstructorSummary,
  LessonCreatePayload,
  LessonCreateResponse,
  LessonDetail,
  ModuleCreatePayload,
  ModuleCreateResponse,
  ModuleDetail,
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

  /**
   * GET /api/courses/instructor-courses — the instructor's OWN courses in
   * EVERY status (draft, in review, rejected, published, archived). Unlike
   * filtered-courses this returns a plain array inside the
   * {success, message, data} envelope, NOT DRF pagination.
   */
  searchInstructorCourses: async (params: CourseSearchParams): Promise<CourseSummary[]> => {
    const { data } = await apiClient.get<ApiEnvelope<CourseSummary[]>>(
      "/courses/instructor-courses",
      { params },
    );
    return data.data;
  },

  /**
   * POST /api/courses/course-create — multipart because `thumbnail` is a
   * file. Sending tags repeatedly (`tags[]`) keeps them a list in Django.
   */
  createCourse: async (payload: CourseCreatePayload): Promise<CourseCreateResponse> => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.subtitle) form.append("subtitle", payload.subtitle);
    form.append("description", payload.description);
    form.append("category", payload.category);
    payload.tags?.forEach((tag) => form.append("tags", tag));
    form.append("level", payload.level);
    form.append("language", payload.language);
    if (payload.thumbnail) form.append("thumbnail", payload.thumbnail);
    if (payload.intro_video) form.append("intro_video", payload.intro_video);
    form.append("pricing_type", payload.pricing_type);
    if (payload.price) form.append("price", payload.price);
    if (payload.requirements) form.append("requirements", payload.requirements);
    if (payload.what_included) form.append("what_included", payload.what_included);

    const { data } = await apiClient.post<ApiEnvelope<CourseCreateResponse>>(
      "/courses/course-create",
      form,
    );
    return data.data;
  },

  /** PATCH /api/courses/course-update-delete/<uuid:pk> — same fields as create. */
  updateCourse: async (
    courseId: string,
    payload: CourseCreatePayload,
  ): Promise<CourseCreateResponse> => {
    const form = new FormData();
    form.append("title", payload.title);
    if (payload.subtitle) form.append("subtitle", payload.subtitle);
    form.append("description", payload.description);
    form.append("category", payload.category);
    payload.tags?.forEach((tag) => form.append("tags", tag));
    form.append("level", payload.level);
    form.append("language", payload.language);
    if (payload.thumbnail) form.append("thumbnail", payload.thumbnail);
    if (payload.intro_video) form.append("intro_video", payload.intro_video);
    form.append("pricing_type", payload.pricing_type);
    if (payload.price) form.append("price", payload.price);
    if (payload.requirements) form.append("requirements", payload.requirements);
    if (payload.what_included) form.append("what_included", payload.what_included);

    const { data } = await apiClient.patch<ApiEnvelope<CourseCreateResponse>>(
      `/courses/course-update-delete/${courseId}`,
      form,
    );
    return data.data;
  },

  /** PATCH /api/courses/module-update-delete/<uuid:pk>. */
  updateModule: async (
    moduleId: string,
    payload: ModuleCreatePayload,
  ): Promise<ModuleCreateResponse> => {
    const { data } = await apiClient.patch<ApiEnvelope<ModuleCreateResponse>>(
      `/courses/module-update-delete/${moduleId}`,
      payload,
    );
    return data.data;
  },

  /** PATCH /api/courses/lesson-update-delete/<uuid:pk>. */
  updateLesson: async (
    lessonId: string,
    payload: LessonCreatePayload,
  ): Promise<LessonCreateResponse> => {
    const { data } = await apiClient.patch<ApiEnvelope<LessonCreateResponse>>(
      `/courses/lesson-update-delete/${lessonId}`,
      payload,
    );
    return data.data;
  },

  /** GET /api/courses/module-detail/<uuid:pk>. */
  fetchModuleDetail: async (moduleId: string): Promise<ModuleDetail> => {
    const { data } = await apiClient.get<ApiEnvelope<ModuleDetail>>(
      `/courses/module-detail/${moduleId}`,
    );
    return data.data;
  },

  /** GET /api/courses/lesson-detail/<uuid:pk>. */
  fetchLessonDetail: async (lessonId: string): Promise<LessonDetail> => {
    const { data } = await apiClient.get<ApiEnvelope<LessonDetail>>(
      `/courses/lesson-detail/${lessonId}`,
    );
    return data.data;
  },

  /** PATCH /api/courses/send-to-review/<uuid:pk> — moves a DRAFT/REJECTED
   * course to IN_REVIEW so SUPERUSERS can approve it. */
  sendCourseToReview: async (courseId: string): Promise<CourseSummary> => {
    const { data } = await apiClient.patch<ApiEnvelope<CourseSummary>>(
      `/courses/send-to-review/${courseId}`,
    );
    return data.data;
  },

  /** POST /api/courses/module-create. */
  createModule: async (payload: ModuleCreatePayload): Promise<ModuleCreateResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<ModuleCreateResponse>>(
      "/courses/module-create",
      payload,
    );
    return data.data;
  },

  /** POST /api/courses/lesson-create. */
  createLesson: async (payload: LessonCreatePayload): Promise<LessonCreateResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<LessonCreateResponse>>(
      "/courses/lesson-create",
      payload,
    );
    return data.data;
  },

  /** DELETE /api/courses/course-update-delete/<uuid:pk> — removes the course
   * and everything inside it (modules, lessons, quizzes, progress). */
  deleteCourse: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/courses/course-update-delete/${courseId}`);
  },

  /** DELETE /api/courses/module-update-delete/<uuid:pk> — removes the module
   * and all its lessons. */
  deleteModule: async (moduleId: string): Promise<void> => {
    await apiClient.delete(`/courses/module-update-delete/${moduleId}`);
  },

  /** DELETE /api/courses/lesson-update-delete/<uuid:pk> — removes the lesson
   * (and its quiz if it has one). */
  deleteLesson: async (lessonId: string): Promise<void> => {
    await apiClient.delete(`/courses/lesson-update-delete/${lessonId}`);
  },
};