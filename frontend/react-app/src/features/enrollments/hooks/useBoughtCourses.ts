import { useCallback, useEffect, useState } from "react";
import { enrollmentsApi } from "../api/enrollmentsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { MyEnrollment } from "../types";

interface UseBoughtCoursesResult {
  courses: MyEnrollment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBoughtCourses(): UseBoughtCoursesResult {
  const [courses, setCourses] = useState<MyEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await enrollmentsApi.fetchMyEnrollments();
      setCourses(data.filter((enrollment) => enrollment.is_bought));
      setError(null);
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await enrollmentsApi.fetchMyEnrollments();
        if (!cancelled) setCourses(data.filter((enrollment) => enrollment.is_bought));
      } catch (err) {
        if (!cancelled) setError(parseApiError(err).generalMessage);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    initialLoad();
    return () => {
      cancelled = true;
    };
  }, []);

  return { courses, isLoading, error, refetch: load };
}
