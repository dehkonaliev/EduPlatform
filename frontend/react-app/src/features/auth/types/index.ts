export type { ApiEnvelope } from "../../../lib/api/types";

export type UserRole = "STUDENT" | "INSTRUCTOR" | "SUPERUSER";
export type AuthType = "EMAIL" | "PHONE" | "GOOGLE";
export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DELETED";
export type ThemeMode = "LIGHT" | "DARK" | "SYSTEM";
/** Which channel a verification code is delivered through. */
export type VerifyType = "VIA_EMAIL" | "VIA_PHONE";

/** From the UserPreference model — nested inside AccountProfile.user_preference. */
export interface UserPreference {
  theme: ThemeMode;
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

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
  username: string;
  user_role: UserRole;
  auth_type: AuthType;
  account_status: AccountStatus;
  email_verified: boolean;
  phone_verified: boolean;
  photo: string | null;
  user_preference: UserPreference | null;
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

// --- Edit profile: PATCH /api/auth/update-profile ---
// Serializer fields: id (read-only), first_name, last_name, username, photo.

export interface UpdateProfileResponseData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  photo: string | null;
}

// --- Verification & account deletion ---
// GET /auth/veirfy-email (sic — backend URL typo) sends a code to an email;
// POST /auth/veirfy-email confirms it. Same shape for /auth/veirfy-phone.

export interface VerifyEmailResponseData {
  email: string;
}

export interface VerifyPhoneResponseData {
  phone_number: string;
}

/** GET /auth/delete-account body + response data. */
export interface AccountDeletionRequestData {
  verify_type: VerifyType;
}