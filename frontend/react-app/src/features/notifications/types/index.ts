export type NotificationType =
  | "NOTIFICATION"
  | "REQUEST"
  | "SUBSCRIPTION"
  | "WARNING"
  | "REPLENISH"
  | "PAYMENT"
  | "PROGRESS";

/** Shape returned by GET /api/notifications/my-notifications. */
export interface AppNotification {
  id: string;
  message: string;
  sender: string | null;
  notif_type: NotificationType;
  is_read: boolean;
}
