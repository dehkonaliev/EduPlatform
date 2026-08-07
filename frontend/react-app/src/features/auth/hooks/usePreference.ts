import { useCallback, useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { UserPreference } from "../types";

interface UsePreferenceResult {
  preference: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePreference(): UsePreferenceResult {
  const [preference, setPreference] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPreference(await authApi.fetchPreference());
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { preference, isLoading, error, refetch: load };
}