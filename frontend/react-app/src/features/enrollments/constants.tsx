import { Ban, CheckCircle2, CirclePlay, CircleSlash2 } from "lucide-react";
import type { EnrollmentStatus } from "./types";

export const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  "ACTIVE",
  "COMPLETED",
  "DROPPED",
  "DEACTIVATED",
];

export const ENROLLMENT_STATUS_META: Record<
  EnrollmentStatus,
  { label: string; icon: typeof CirclePlay; badgeClassName: string }
> = {
  ACTIVE: {
    label: "Active",
    icon: CirclePlay,
    badgeClassName: "bg-ember-400/10 text-ember-700 dark:text-ember-400",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    badgeClassName: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  },
  DROPPED: {
    label: "Dropped",
    icon: CircleSlash2,
    badgeClassName: "bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300",
  },
  DEACTIVATED: {
    label: "Deactivated",
    icon: Ban,
    badgeClassName: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};
