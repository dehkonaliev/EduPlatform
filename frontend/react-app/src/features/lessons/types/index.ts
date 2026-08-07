import type { CourseLesson, LessonType } from "../../courses/types";

export interface LessonCurriculumModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

/** Full course structure for the lesson-player sidebar — returned inside
 * GET /api/courses/lesson-detail/<uuid:pk> as the `curriculum` field. */
export interface LessonCurriculum {
  id: string;
  title: string;
  slug: string;
  modules: LessonCurriculumModule[];
}

/** Shape returned by GET /api/courses/lesson-detail/<uuid:pk> */
export interface LessonDetail {
  id: string;
  title: string;
  lesson_type: LessonType;
  video_url: string | null;
  content: string | null;
  duration_minutes: number;
  order: number;
  is_preview: boolean;
  curriculum: LessonCurriculum;
  /** LessonProgress record for the current student + this lesson, used to
   * mark the lesson complete. Null when the student has no enrollment
   * progress record for this lesson. */
  progress_id: string | null;
  /** Whether that progress record is already completed. */
  progress_completed: boolean;
  /** Id of the quiz attached to this lesson (QUIZ / ASSIGNMENT), if any. */
  quiz: string | null;
}

/** Shape of a single LessonProgress record — returned by
 * POST /api/enrollments/lesson-progress/<uuid:pk>. */
export interface LessonProgressData {
  id: string;
  lesson: string;
}

/** Response of POST /api/enrollments/lesson-progress/<uuid:pk> */
export interface CompleteLessonResult {
  completed: LessonProgressData;
  next: LessonProgressData | null;
  course_completed: boolean;
}
