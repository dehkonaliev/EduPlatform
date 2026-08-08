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
 * Confirmed shape from GET /api/profile/instructor-profile (InstructorProfile
 * model + InstructorProfileSerializer): headline/bio/links are writable;
 * total_courses_created, total_students_taught and approval_status are
 * read_only on the backend.
 */
export interface InstructorProfile {
  headline: string | null;
  bio: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  total_courses_created: number;
  total_students_taught: number;
  approval_status: InstructorApprovalStatus;
}

/** Backend InstructorProfile.ApprovalStatus choices. */
export type InstructorApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * PATCH /api/profile/instructor-profile — only headline, bio, linkedin_url
 * and website_url are writable; everything else is read_only per the
 * serializer. Validation rules (client-side mirrors these exactly):
 *  - headline: 5–200 chars
 *  - bio: 20–2000 chars
 *  - linkedin_url: valid http(s) URL containing linkedin.com
 *  - website_url: valid http(s) URL
 *  - at least one of linkedin_url / website_url must be provided
 */
export interface UpdateInstructorProfilePayload {
  headline?: string;
  bio?: string;
  linkedin_url?: string;
  website_url?: string;
}