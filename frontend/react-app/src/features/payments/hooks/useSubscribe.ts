import { useCallback, useState } from "react";
import { paymentsApi } from "../api/paymentsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { NewSubscription } from "../types";

interface UseSubscribeResult {
  /** Subscribes the student to the given plan. Returns the new subscription
   * on success, or null (with `error` set) on failure. */
  subscribe: (planId: string) => Promise<NewSubscription | null>;
  isSubscribing: boolean;
  error: string | null;
}

export function useSubscribe(): UseSubscribeResult {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(async (planId: string) => {
    setIsSubscribing(true);
    setError(null);
    try {
      return await paymentsApi.subscribe(planId);
    } catch (err) {
      setError(parseApiError(err).generalMessage);
      return null;
    } finally {
      setIsSubscribing(false);
    }
  }, []);

  return { subscribe, isSubscribing, error };
}
