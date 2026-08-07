import { useCallback, useEffect, useState } from "react";
import { paymentsApi } from "../api/paymentsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { Subscription } from "../types";

interface UseMySubscriptionsResult {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMySubscriptions(): UseMySubscriptionsResult {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const data = await paymentsApi.fetchMySubscriptions();
      setSubscriptions(data);
      setError(null);
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await paymentsApi.fetchMySubscriptions();
        if (!cancelled) setSubscriptions(data);
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

  return { subscriptions, isLoading, error, refetch };
}
