import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { AppNotification } from "../types";

export const notificationsApi = {
  /** GET /api/notifications/my-notifications — the current user's notifications. */
  fetchNotifications: async (): Promise<AppNotification[]> => {
    const { data } = await apiClient.get<ApiEnvelope<AppNotification[]>>(
      "/notifications/my-notifications",
    );
    return data.data;
  },

  /** PATCH /api/notifications/read-delete-notification/<uuid:pk> — mark read. */
  markAsRead: async (notificationId: string): Promise<void> => {
    await apiClient.patch(`/notifications/read-delete-notification/${notificationId}`);
  },

  /** DELETE /api/notifications/read-delete-notification/<uuid:pk> — remove. */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await apiClient.delete(`/notifications/read-delete-notification/${notificationId}`);
  },
};
