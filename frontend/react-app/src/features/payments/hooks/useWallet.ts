import { useCallback, useEffect, useState } from "react";
import { paymentsApi } from "../api/paymentsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { Wallet } from "../types";

interface UseWalletResult {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWallet(): UseWalletResult {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const data = await paymentsApi.fetchWallet();
      setWallet(data);
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
        const data = await paymentsApi.fetchWallet();
        if (!cancelled) setWallet(data);
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

  return { wallet, isLoading, error, refetch };
}
