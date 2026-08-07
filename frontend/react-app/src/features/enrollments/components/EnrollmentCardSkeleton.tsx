export function EnrollmentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900 sm:flex-row">
      <div className="aspect-video w-full shrink-0 animate-pulse bg-paper-200 dark:bg-ink-800 sm:aspect-auto sm:w-60 lg:w-72" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-paper-200 dark:bg-ink-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-paper-200 dark:bg-ink-800" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded-full bg-paper-200 dark:bg-ink-800" />
        </div>
        <div className="h-3 w-2/5 animate-pulse rounded bg-paper-200 dark:bg-ink-800" />
        <div className="mt-auto pt-2">
          <div className="h-1.5 w-full animate-pulse rounded-full bg-paper-200 dark:bg-ink-800" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-7 w-32 animate-pulse rounded-full bg-paper-200 dark:bg-ink-800" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-paper-200 dark:bg-ink-800" />
        </div>
      </div>
    </div>
  );
}
