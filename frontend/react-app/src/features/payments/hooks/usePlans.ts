import { useEffect, useState } from "react";
import { paymentsApi } from "../api/paymentsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { Plan } from "../types";

interface UsePlansResult {
  plans: Plan[];
  isLoading: boolean;
  error: string | null;
}

export function usePlans(): UsePlansResult {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await paymentsApi.fetchPlans();
        if (!cancelled) setPlans(data);
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

  return { plans, isLoading, error };
}
