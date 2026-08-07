import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { NewSubscription, Plan, Subscription, Wallet } from "../types";

export const paymentsApi = {
  /** GET /api/payments/plans — all available subscription plans. */
  fetchPlans: async (): Promise<Plan[]> => {
    const { data } = await apiClient.get<ApiEnvelope<Plan[]>>(`/payments/plans`);
    return data.data;
  },

  /** GET /api/payments/my-wallet — the student's wallet + transactions. */
  fetchWallet: async (): Promise<Wallet> => {
    const { data } = await apiClient.get<ApiEnvelope<Wallet>>(`/payments/my-wallet`);
    return data.data;
  },

  /** GET /api/payments/my-subscriptions — the student's subscriptions. */
  fetchMySubscriptions: async (): Promise<Subscription[]> => {
    const { data } = await apiClient.get<ApiEnvelope<Subscription[]>>(
      `/payments/my-subscriptions`,
    );
    return data.data;
  },

  /** POST /api/payments/subscribe — buys a plan with wallet balance. */
  subscribe: async (subscriptionPlan: string): Promise<NewSubscription> => {
    const { data } = await apiClient.post<ApiEnvelope<NewSubscription>>(
      `/payments/subscribe`,
      { subscription_plan: subscriptionPlan },
    );
    return data.data;
  },

  /** POST /api/payments/buy-course — pays for a SPECIAL-priced course with
   * wallet balance. Resolves with the backend message on success. */
  buyCourse: async (courseId: string): Promise<string> => {
    const { data } = await apiClient.post<ApiEnvelope<unknown>>(
      `/payments/buy-course`,
      { course: courseId },
    );
    return data.message;
  },
};
