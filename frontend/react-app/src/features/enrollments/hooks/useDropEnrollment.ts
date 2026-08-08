import { useCallback, useState } from "react";
import { enrollmentsApi } from "../api/enrollmentsApi";
import { parseApiError } from "../../../lib/api/parseApiError";

interface UseDropEnrollmentResult {
  /** Drops the enrollment and resolves true on success, false on failure. */
  drop: (enrollmentId: string) => Promise<boolean>;
  isDropping: boolean;
  error: string | null;
}

export function useDropEnrollment(): UseDropEnrollmentResult {
  const [isDropping, setIsDropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const drop = useCallback(async (enrollmentId: string) => {
    setIsDropping(true);
    setError(null);
    try {
      await enrollmentsApi.dropEnrollment(enrollmentId);
      return true;
    } catch (err) {
      setError(parseApiError(err).generalMessage);
      return false;
    } finally {
      setIsDropping(false);
    }
  }, []);

  return { drop, isDropping, error };
}
