import { useCallback, useEffect, useState } from "react";
import { coursesApi } from "../api/coursesApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { CourseSearchParams, CourseSummary } from "../types";

interface UseInstructorCoursesResult {
  filters: CourseSearchParams;
  setFilter: (key: keyof CourseSearchParams, value: string) => void;
  clearFilters: () => void;
  courses: CourseSummary[];
  count: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** Loads the signed-in instructor's OWN courses via /courses/instructor-courses
 * (every status — draft through published). Returns a plain array — the
 * endpoint does not paginate, unlike the student filtered-courses one. */
export function useInstructorCourses(
  initialParams: CourseSearchParams = {},
): UseInstructorCoursesResult {
  const [filters, setFilters] = useState<CourseSearchParams>(initialParams);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (nextFilters: CourseSearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await coursesApi.searchInstructorCourses(nextFilters);
      setCourses(data);
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(filters);
  }, [fetchCourses, filters]);

  const setFilter = useCallback((key: keyof CourseSearchParams, value: string) => {
    setFilters((prev) => {
      const next = { ...prev } as Record<string, string | undefined>;
      if ((next[key] ?? "") === value) return prev;
      if (value === "") delete next[key];
      else next[key] = value;
      return next as CourseSearchParams;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    filters,
    setFilter,
    clearFilters,
    courses,
    count: courses.length,
    isLoading,
    error,
    refetch: () => fetchCourses(filters),
  };
}
