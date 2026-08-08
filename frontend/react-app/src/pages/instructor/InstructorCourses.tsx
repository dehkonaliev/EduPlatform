import { CourseCatalog } from "./CourseCatalog";
import type { CourseStatus } from "../../features/courses/types";

interface CoursesStatusPageProps {
  status?: CourseStatus;
}

/** One tab of the My Courses sidebar — a course catalog filtered to a single
 * publishing status (or all of them when no status is given). */
export default function CoursesStatusPage({ status }: CoursesStatusPageProps) {
  return <CourseCatalog statusFilter={status} />;
}
