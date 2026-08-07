import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        verified
          ? "bg-teal-500/10 text-teal-700 dark:text-teal-400"
          : "bg-ember-400/10 text-ember-700 dark:text-ember-400",
      )}
    >
      {verified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {verified ? "Verified" : "Not verified"}
    </span>
  );
}
