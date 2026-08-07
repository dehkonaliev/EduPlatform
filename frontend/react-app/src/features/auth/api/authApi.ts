import { apiClient } from "../../../lib/api/client";
import type {
  AccountProfile,
  ActivatePayload,
  ActivateResponseData,
  ApiEnvelope,
  AuthTokens,
  LoginPayload,
  SignupPayload,
  SignupResponseData,
  UpdateProfileResponseData,
  UserPreference,
  VerifyCodePayload,
  VerifyCodeResponseData,
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
};