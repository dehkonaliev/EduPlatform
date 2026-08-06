import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../features/auth/api/authApi";
import { tokenStorage } from "../lib/api/tokenStorage";
import type { AccountProfile, LoginPayload } from "../features/auth/types";

interface AuthContextValue {
  user: AccountProfile | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetch after e.g. updating the profile photo or verifying email */
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    const profile = await authApi.fetchMyProfile();
    setUser(profile);

    // A suspended/deactivated account shouldn't stay "logged in" in the UI
    if (profile.account_status !== "ACTIVE") {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  // On first load, if a refresh token exists, try to restore the session.
  useEffect(() => {
    async function restoreSession() {
      if (!tokenStorage.getRefresh()) {
        setIsLoading(false);
        return;
      }
      try {
        await refetchUser();
      } catch {
        tokenStorage.clear();
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, [refetchUser]);

  const login = useCallback(async (payload: LoginPayload) => {
  const tokens = await authApi.login(payload);
  tokenStorage.setTokens(tokens.access, tokens.refresh);
  const profile = await authApi.fetchMyProfile();
  setUser(profile);
}, []);

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}