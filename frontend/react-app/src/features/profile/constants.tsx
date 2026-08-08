import type { InstructorApprovalStatus } from "./types";

/** Badge + label for the instructor's publishing approval state. */
export const APPROVAL_STATUS_META: Record<
  InstructorApprovalStatus,
  { label: string; badgeClassName: string }
> = {
  PENDING: {
    label: "Pending approval",
    badgeClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  APPROVED: {
    label: "Approved",
    badgeClassName: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  },
  REJECTED: {
    label: "Rejected",
    badgeClassName: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};
