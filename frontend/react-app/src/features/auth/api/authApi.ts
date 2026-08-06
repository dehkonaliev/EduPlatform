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
  VerifyCodePayload,
  VerifyCodeResponseData,
} from "../types";

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
};