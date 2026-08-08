// Confirmed exact set from the backend model.
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";

// Confirmed exact set from the backend model.
export type PricingType = "FREE" | "MONTHLY" | "SPECIAL";

export type CourseStatus = "DRAFT" | "IN_REVIEW" | "REJECTED" | "PUBLISHED" | "ARCHIVED";

// Confirmed real values: "QUIZ", "ASSIGNMENT". The rest are a reasonable
// guess for a course platform (video lessons, articles) — confirm and
// extend as you see more real lesson_type values.
export type LessonType = "VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT";

export interface CourseInstructor {
  id: string;
  full_name: string;
  photo: string | null;
}

/** Shape returned by GET /api/courses/my-feed (also reused for filtered-courses, likely). */
export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  category: string; // category UUID — resolve against /courses/categories if you need the name
  level: CourseLevel;
  language: string;
  thumbnail: string | null;
  average_rating: string; // comes back as a numeric string, e.g. "4.00"
  rating_count: number;
  instructor: CourseInstructor;
  /** Current publishing workflow state — present on instructor-courses and
   * always "PUBLISHED" on the public endpoints. */
  status: CourseStatus;
}

/** Option shapes for the search/filter page. */
export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface TagSummary {
  id: string;
  name: string;
}

export interface InstructorSummary {
  id: string;
  full_name: string;
  photo: string | null;
}

/** Query params accepted by GET /api/courses/filtered-courses. */
export interface CourseSearchParams {
  search?: string;
  instructor?: string; // instructor user UUID
  category?: string; // category UUID
  tag?: string; // tag name
  level?: CourseLevel;
  language?: string;
  pricing_type?: PricingType;
  rating?: string; // "3", "4", "4.5", "5" — courses with average_rating >= value
}

/** Filtered-courses returns DRF pagination directly (no success/data envelope):
 * { count, next, previous, results }. */
export interface PaginatedCourseResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourseSummary[];
}

/**
 * Instructor shape on the DETAIL endpoint — different from CourseInstructor
 * above (no `id`, split first/last name instead of full_name). Don't merge
 * these two types, the backend genuinely returns different shapes.
 */
export interface CourseDetailInstructor {
  first_name: string;
  last_name: string;
  photo: string | null;
}

export interface CourseLesson {
  id: string;
  title: string;
  lesson_type: LessonType;
  duration_minutes: number;
  order: number;
  is_preview: boolean;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  course: string; // course UUID
  lessons: CourseLesson[];
}

/** Multipart payload for POST /api/courses/course-create (thumbnail is a file). */
export interface CourseCreatePayload {
  title: string;
  subtitle?: string;
  description: string;
  category: string; // category UUID
  tags?: string[]; // tag UUIDs
  level: CourseLevel;
  language: string;
  thumbnail?: File;
  intro_video?: string;
  pricing_type: PricingType;
  /** Required (and > 0) when pricing_type is MONTHLY or SPECIAL. */
  price?: string;
  requirements?: string;
  what_included?: string;
}

/** Data returned by POST /api/courses/course-create (CourseCreateUpdateSerializer). */
export interface CourseCreateResponse {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string;
  category: string; // category UUID
  tags: string[]; // tag UUIDs
  level: CourseLevel;
  language: string;
  thumbnail: string | null;
  intro_video: string | null;
  pricing_type: PricingType;
  price: string;
  requirements: string | null;
  what_included: string | null;
}

/** Payload for POST /api/courses/module-create. */
export interface ModuleCreatePayload {
  course: string; // course UUID
  title: string;
  order: number;
}

/** Data returned by POST /api/courses/module-create. */
export interface ModuleCreateResponse {
  id: string;
  course: string; // course UUID
  title: string;
  order: number;
}

/** Payload for POST /api/courses/lesson-create. */
export interface LessonCreatePayload {
  module: string; // module UUID
  title: string;
  lesson_type: LessonType;
  video_url?: string;
  content?: string;
  duration_minutes: number;
  order: number;
  is_preview: boolean;
}

/** Data returned by POST /api/courses/lesson-create. */
export interface LessonCreateResponse {
  id: string;
  module: string; // module UUID
  title: string;
  lesson_type: LessonType;
  video_url: string | null;
  content: string | null;
  duration_minutes: number;
  order: number;
  is_preview: boolean;
}

/** Shape returned by GET /api/courses/module-detail/<uuid:pk>. */
export interface ModuleDetail {
  id: string;
  title: string;
  order: number;
  course: {
    id: string;
    title: string;
    slug: string;
    modules: { id: string; title: string; order: number }[];
  };
  lessons: CourseLesson[];
}

/** Shape returned by GET /api/courses/lesson-detail/<uuid:pk>. */
export interface LessonDetail {
  id: string;
  title: string;
  lesson_type: LessonType;
  video_url: string | null;
  content: string | null;
  duration_minutes: number;
  order: number;
  is_preview: boolean;
  module: CourseModule;
  progress_id: string | null;
  progress_completed: boolean;
  quiz: string | null;
}

/** Shape returned by GET /api/courses/course-detail/<uuid:pk> */
export interface CourseDetail {
  instructor: CourseDetailInstructor;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string; // category UUID
  tags: string[]; // tag UUIDs
  level: CourseLevel;
  language: string;
  thumbnail: string | null;
  intro_video: string | null; // YouTube URL
  pricing_type: PricingType;
  price: string; // numeric string, e.g. "29.99" — "0.00" or similar expected when FREE
  status: CourseStatus;
  published_at: string | null;
  total_enrollments: number;
  average_rating: string;
  rating_count: number;
  total_reviews: number;
  requirements: string;
  what_included: string;
  modules: CourseModule[];
  is_enrolled: boolean;
  /** Lesson UUID where the logged-in user left off — null when not enrolled
   * or when they haven't opened a lesson yet. Use to deep-link "Start
   * learning" to /learn/<uuid>. */
  last_accessed_lesson: string | null;
}