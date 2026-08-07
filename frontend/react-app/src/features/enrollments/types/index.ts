import type { CourseSummary } from "../../courses/types";

// Confirmed exact set from the backend model (Enrollment.Status).
export type EnrollmentStatus = "ACTIVE" | "COMPLETED" | "DROPPED" | "DEACTIVATED";

/** Shape returned by GET /api/enrollments/my-enrollments */
export interface MyEnrollment {
  id: string;
  course: CourseSummary;
  status: EnrollmentStatus;
  /** First lesson of the course — deep-link /learn/<uuid> for a fresh start. */
  first_lesson: string | null;
  is_bought: boolean;
  progress_percentage: string; // numeric string, e.g. "0.00" / "42.50"
  last_accessed_lesson: string | null; // lesson UUID — link to /learn/<uuid> to resume
  last_accessed_at: string | null;
  enrolled_at: string;
  completed_at: string | null;
}
