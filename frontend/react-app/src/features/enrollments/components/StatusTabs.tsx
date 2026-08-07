import { ENROLLMENT_STATUSES, ENROLLMENT_STATUS_META } from "../constants";
import { cn } from "../../../lib/utils";
import type { EnrollmentStatus } from "../types";

interface StatusTabsProps {
  active: EnrollmentStatus;
  onChange: (status: EnrollmentStatus) => void;
}

export function StatusTabs({ active, onChange }: StatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Enrollment status"
      className="flex gap-1 overflow-x-auto rounded-full bg-paper-100 p-1 dark:bg-ink-900"
    >
      {ENROLLMENT_STATUSES.map((status) => {
        const meta = ENROLLMENT_STATUS_META[status];
        const isActive = active === status;
        return (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(status)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-ink-950 shadow-sm dark:bg-ink-800 dark:text-paper-50"
                : "text-ink-600 hover:text-ink-950 dark:text-ink-300 dark:hover:text-paper-100",
            )}
          >
            <meta.icon size={14} />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
