import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CreditCard,
  TrendingUp,
  UserPlus,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "./types";

export interface NotificationTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Colored circle behind the icon. */
  iconClassName: string;
}

export const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = {
  NOTIFICATION: {
    label: "Notification",
    icon: Bell,
    iconClassName: "bg-ink-500/10 text-ink-600 dark:text-ink-300",
  },
  REQUEST: {
    label: "Friend request",
    icon: UserPlus,
    iconClassName: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  SUBSCRIPTION: {
    label: "Subscription",
    icon: CalendarClock,
    iconClassName: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  },
  WARNING: {
    label: "Warning",
    icon: AlertTriangle,
    iconClassName: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  },
  REPLENISH: {
    label: "Replenish",
    icon: Wallet,
    iconClassName: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  },
  PAYMENT: {
    label: "Payment",
    icon: CreditCard,
    iconClassName: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  PROGRESS: {
    label: "Progress",
    icon: TrendingUp,
    iconClassName: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  },
};
