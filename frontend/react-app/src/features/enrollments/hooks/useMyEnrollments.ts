import { useEffect, useState } from "react";
import { enrollmentsApi } from "../api/enrollmentsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { EnrollmentStatus, MyEnrollment } from "../types";

interface UseMyEnrollmentsResult {
  enrollments: MyEnrollment[];
  isLoading: boolean;
  error: string | null;
}

export function useMyEnrollments(status: EnrollmentStatus): UseMyEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<MyEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await enrollmentsApi.fetchMyEnrollments(status);
        if (!cancelled) setEnrollments(data);
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
  }, [status]);

  return { enrollments, isLoading, error };
}
