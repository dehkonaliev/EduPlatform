const ACCESS_KEY = "curiosite-access-token";
const REFRESH_KEY = "curiosite-refresh-token";
const ACTIVATION_KEY = "activation_token";

/**
 * Single source of truth for where tokens live. If you later switch to
 * httpOnly cookies, this is the only file that needs to change — everything
 * else calls these functions instead of touching localStorage directly.
 */
export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  setAccess: (access: string) => {
    localStorage.setItem(ACCESS_KEY, access);
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  // --- Signup flow: short-lived token proving email/phone was verified,
  // exchanged for a real account in the activation step ---
  getActivationToken: () => localStorage.getItem(ACTIVATION_KEY),
  setActivationToken: (token: string) => localStorage.setItem(ACTIVATION_KEY, token),
  clearActivationToken: () => localStorage.removeItem(ACTIVATION_KEY),
};