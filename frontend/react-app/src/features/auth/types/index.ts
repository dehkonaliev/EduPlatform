export type UserRole = "STUDENT" | "INSTRUCTOR";
export type AuthType = "VIA_EMAIL" | "VIA_PHONE"; // tell me if there's a social-login variant too
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED"; // confirm the non-ACTIVE values with your backend

/**
 * Account-level data — the unwrapped `data` field from
 * GET /api/auth/my-profile (backend wraps it in {success, message, data}).
 */
export interface AccountProfile {
  id: string;
  email: string | null;
  phone_number: string | null;
  first_name: string;
  last_name: string;
  user_role: UserRole;
  auth_type: AuthType;
  account_status: AccountStatus;
  email_verified: boolean;
  phone_verified: boolean;
  photo: string | null;
  user_preference: unknown;
}

/** Generic envelope shape your backend wraps every response in. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginPayload {
  email_username_phone: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// --- Signup flow (3 steps: request code -> verify code -> activate) ---

export interface SignupPayload {
  email_or_phone: string;
}

export interface SignupResponseData {
  email?: string;
  phone_number?: string;
}

export interface VerifyCodePayload {
  email_or_phone: string;
  verification_code: string;
}

export interface VerifyCodeResponseData {
  email?: string;
  phone_number?: string;
  token: string;
}

export interface ActivatePayload {
  token: string;
  first_name: string;
  last_name: string;
  username: string;
  user_role: UserRole;
  password: string;
  conf_password: string;
}

export interface ActivateResponseData {
  token: string;
  first_name: string;
  last_name: string;
  username: string;
  user_role: UserRole;
}