// Confirmed exact set from the backend model.
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";

// Confirmed exact set from the backend model.
export type PricingType = "FREE" | "MONTHLY" | "SPECIAL";

export type CourseStatus = "DRAFT" | "REVIEW" | "PUBLISHED" | "ARCHIVED"; // from readme's publishing workflow description — not confirmed against a real payload value other than "PUBLISHED"

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
}