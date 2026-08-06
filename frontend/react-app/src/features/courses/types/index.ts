export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; // confirm exact values with backend

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