export function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="aspect-video w-full animate-pulse bg-paper-200 dark:bg-ink-800" />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-paper-200 dark:bg-ink-800" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-paper-200 dark:bg-ink-800" />
        <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-paper-200 dark:bg-ink-800" />
      </div>
    </div>
  );
}