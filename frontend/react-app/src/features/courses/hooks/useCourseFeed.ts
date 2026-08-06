import { useEffect, useState } from "react";
import { coursesApi } from "../api/coursesApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { CourseSummary } from "../types";

interface UseCourseFeedResult {
  courses: CourseSummary[];
  isLoading: boolean;
  error: string | null;
}

export function useCourseFeed(): UseCourseFeedResult {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await coursesApi.fetchMyFeed();
        if (!cancelled) setCourses(data);
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
  }, []);

  return { courses, isLoading, error };
}