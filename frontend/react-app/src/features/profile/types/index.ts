export type Gender = "MALE" | "FEMALE";

/** Confirmed shape from GET /api/profile/student-profile */
export interface StudentProfile {
  gender: Gender | null;
  bio: string | null;
  is_visible: boolean;
  xp: number;
  streak: number;
  level: number;
  total_courses_enrolled: number;
  total_courses_completed: number;
  total_certificates_earned: number;
}

/**
 * PATCH /api/profile/student-profile — only these 3 fields are writable;
 * everything else on StudentProfile is read_only per your serializer.
 */
export interface UpdateStudentProfilePayload {
  gender?: Gender | null;
  bio?: string;
  is_visible?: boolean;
}

/**
 * NOT confirmed against a real response yet — built from your readme's field
 * list for PATCH /api/profile/instructor-profile (headline, bio, linkedin_url,
 * website_url). Send me a real GET response for this endpoint and I'll correct
 * anything that's wrong here.
 */
export interface InstructorProfile {
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  website_url: string | null;
}