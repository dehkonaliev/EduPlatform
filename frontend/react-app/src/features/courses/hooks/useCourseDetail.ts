import { useEffect, useState } from "react";
import { coursesApi } from "../api/coursesApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { CourseDetail } from "../types";

interface UseCourseDetailResult {
  course: CourseDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function useCourseDetail(courseId: string | undefined): UseCourseDetailResult {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await coursesApi.fetchCourseDetail(courseId!);
        if (!cancelled) setCourse(data);
      } catch (err) {
        if (!cancelled) setError(parseApiError(err).generalMessage);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return { course, isLoading, error };
}