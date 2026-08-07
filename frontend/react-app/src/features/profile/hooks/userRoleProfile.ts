import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../providers/AuthProvider";
import { profileApi } from "../api/profileApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { InstructorProfile, StudentProfile } from "../types";

interface UseRoleProfileResult {
  studentProfile: StudentProfile | null;
  instructorProfile: InstructorProfile | null;
  isLoading: boolean;
  error: string | null;
  /** Re-fetch after e.g. saving an edit in the settings form */
  refetch: () => Promise<void>;
}

/**
 * SUPERUSER accounts have neither profile type — studentProfile and
 * instructorProfile both stay null in that case, nothing to fetch.
 */
export function useRoleProfile(): UseRoleProfileResult {
  const { user } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (user.user_role === "STUDENT") {
        setStudentProfile(await profileApi.fetchStudentProfile());
      } else if (user.user_role === "INSTRUCTOR") {
        setInstructorProfile(await profileApi.fetchInstructorProfile());
      }
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  return { studentProfile, instructorProfile, isLoading, error, refetch: load };
}