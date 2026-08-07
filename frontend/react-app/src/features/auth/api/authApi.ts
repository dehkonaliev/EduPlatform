import { apiClient } from "../../../lib/api/client";
import type {
  AccountDeletionRequestData,
  AccountProfile,
  ActivatePayload,
  ActivateResponseData,
  ApiEnvelope,
  AuthTokens,
  LoginPayload,
  PasswordChangePayload,
  PasswordResetConfirmPayload,
  PasswordResetRequestPayload,
  PasswordResetRequestResponseData,
  SignupPayload,
  SignupResponseData,
  UpdateProfileResponseData,
  UserPreference,
  VerifyCodePayload,
  VerifyCodeResponseData,
  VerifyEmailResponseData,
  VerifyPhoneResponseData,
  VerifyType,
} from "../types";

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  username?: string;
  /** Only include when the user picked a new file — omit to leave the existing photo unchanged. */
  photo?: File;
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<ApiEnvelope<AuthTokens>>("/auth/login", payload);
    return data.data;
  },

  logout: async (refresh: string) => {
    await apiClient.post("/auth/logout", { refresh });
  },

  /** Account-level data: identity, contact, verification, status. */
  fetchMyProfile: async (): Promise<AccountProfile> => {
    const { data } = await apiClient.get<ApiEnvelope<AccountProfile>>("/auth/my-profile");
    return data.data;
  },

  // --- Signup flow ---

  /** Step 1: request a 6-digit verification code by email or phone. */
  signup: async (payload: SignupPayload) => {
    const { data } = await apiClient.post<ApiEnvelope<SignupResponseData>>("/auth/signup", payload);
    return data.data;
  },

  /** Step 2: verify the code, receive a short-lived activation token. */
  verifyCode: async (payload: VerifyCodePayload) => {
    const { data } = await apiClient.post<ApiEnvelope<VerifyCodeResponseData>>(
      "/auth/verification-code",
      payload,
    );
    return data.data;
  },

  /** Step 3: exchange the activation token + profile details for a real account. */
  activateAccount: async (payload: ActivatePayload) => {
    const { data } = await apiClient.post<ApiEnvelope<ActivateResponseData>>(
      "/auth/activation",
      payload,
    );
    return data.data;
  },

  /**
   * Multipart because `photo` is a file — axios sets the correct
   * multipart/form-data boundary automatically when given a FormData body,
   * so no manual Content-Type header needed.
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<UpdateProfileResponseData> => {
    const form = new FormData();
    if (payload.first_name !== undefined) form.append("first_name", payload.first_name);
    if (payload.last_name !== undefined) form.append("last_name", payload.last_name);
    if (payload.username !== undefined) form.append("username", payload.username);
    if (payload.photo) form.append("photo", payload.photo);

    const { data } = await apiClient.patch<ApiEnvelope<UpdateProfileResponseData>>(
      "/auth/update-profile",
      form,
    );
    return data.data;
  },

  /** GET /api/auth/preference — the real current values, no frontend defaults. */
  fetchPreference: async (): Promise<UserPreference> => {
    const { data } = await apiClient.get<ApiEnvelope<UserPreference>>("/auth/preference");
    return data.data;
  },

  /**
   * PATCH /api/auth/preference — theme, language, timezone, notification
   * toggles. Plain JSON, NOT FormData — there's no file field here, and
   * these are separate from update-profile's fields (first_name/last_name/
   * username/photo). Don't merge the two payloads.
   */
  updatePreference: async (payload: Partial<UserPreference>): Promise<UserPreference> => {
    const { data } = await apiClient.patch<ApiEnvelope<UserPreference>>(
      "/auth/preference",
      payload,
    );
    return data.data;
  },

  // --- Contact verification (note: backend URLs are "veirfy-email"/"veirfy-phone") ---
  // The same endpoint handles both steps, distinguished by payload:
  //   POST { email | phone_number } → saves the value and sends a 6-digit code
  //   POST { code }                 → confirms the code, marks it verified

  /** POST /api/auth/veirfy-email — saves the email and sends a code to it. */
  requestEmailVerification: async (email: string): Promise<VerifyEmailResponseData> => {
    const { data } = await apiClient.post<ApiEnvelope<VerifyEmailResponseData>>(
      "/auth/veirfy-email",
      { email },
    );
    return data.data;
  },

  /** POST /api/auth/veirfy-email — confirms the code, marks the email verified. */
  verifyEmailCode: async (code: string): Promise<VerifyEmailResponseData> => {
    const { data } = await apiClient.post<ApiEnvelope<VerifyEmailResponseData>>(
      "/auth/veirfy-email",
      { code },
    );
    return data.data;
  },

  /** POST /api/auth/veirfy-phone — saves the phone and queues a Telegram code. */
  requestPhoneVerification: async (phoneNumber: string): Promise<VerifyPhoneResponseData> => {
    const { data } = await apiClient.post<ApiEnvelope<VerifyPhoneResponseData>>(
      "/auth/veirfy-phone",
      { phone_number: phoneNumber },
    );
    return data.data;
  },

  /** POST /api/auth/veirfy-phone — confirms the code, marks the phone verified. */
  verifyPhoneCode: async (code: string): Promise<VerifyPhoneResponseData> => {
    const { data } = await apiClient.post<ApiEnvelope<VerifyPhoneResponseData>>(
      "/auth/veirfy-phone",
      { code },
    );
    return data.data;
  },

  // --- Delete account (code required, from a verified email or phone) ---

  /** POST /api/auth/delete-account — sends the deletion code over the chosen channel. */
  requestAccountDeletion: async (verifyType: VerifyType): Promise<AccountDeletionRequestData> => {
    const { data } = await apiClient.post<ApiEnvelope<AccountDeletionRequestData>>(
      "/auth/delete-account",
      { verify_type: verifyType },
    );
    return data.data;
  },

  /** POST /api/auth/delete-account — confirms the code and deletes the account. */
  confirmAccountDeletion: async (verificationCode: string): Promise<void> => {
    await apiClient.post<ApiEnvelope<unknown>>("/auth/delete-account", {
      verification_code: verificationCode,
    });
  },

  // --- Password flows ---

  /** POST /api/auth/password-change — change the password while signed in. */
  changePassword: async (payload: PasswordChangePayload): Promise<void> => {
    await apiClient.post<ApiEnvelope<unknown>>("/auth/password-change", payload);
  },

  /**
   * POST /api/auth/password-reset-request — emails a reset link for an
   * email address, or explains the Telegram route for a phone number.
   */
  requestPasswordReset: async (
    payload: PasswordResetRequestPayload,
  ): Promise<PasswordResetRequestResponseData> => {
    const { data } = await apiClient.post<ApiEnvelope<PasswordResetRequestResponseData>>(
      "/auth/password-reset-request",
      payload,
    );
    return data.data;
  },

  /** POST /api/auth/password-reset-confirm — set a new password with the emailed token. */
  confirmPasswordReset: async (payload: PasswordResetConfirmPayload): Promise<void> => {
    await apiClient.post<ApiEnvelope<unknown>>("/auth/password-reset-confirm", payload);
  },
};