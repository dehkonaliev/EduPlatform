import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Search } from "lucide-react";
import { AppNavbar } from "../AppNavbar";
import { StatusTabs } from "../features/enrollments/components/StatusTabs";
import { EnrollmentCard } from "../features/enrollments/components/EnrollmentCard";
import { EnrollmentCardSkeleton } from "../features/enrollments/components/EnrollmentCardSkeleton";
import { useMyEnrollments } from "../features/enrollments/hooks/useMyEnrollments";
import { ENROLLMENT_STATUS_META } from "../features/enrollments/constants";
import type { EnrollmentStatus } from "../features/enrollments/types";

const SKELETON_COUNT = 3;

export default function MyLearningPage() {
  const [status, setStatus] = useState<EnrollmentStatus>("ACTIVE");
  const { enrollments, isLoading, error, refetch } = useMyEnrollments(status);

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              My Learning
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              Every course you've enrolled in — pick up where you left off.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 px-3.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <Search size={14} />
            Explore courses
          </Link>
        </div>

        <div className="mt-6">
          <StatusTabs active={status} onChange={setStatus} />
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-5">
          {isLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <EnrollmentCardSkeleton key={index} />
            ))
          ) : enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} onDropped={refetch} />
            ))
          ) : (
            <EmptyState status={status} />
          )}
        </div>
      </main>
    </>
  );
}

function EmptyState({ status }: { status: EnrollmentStatus }) {
  const label = ENROLLMENT_STATUS_META[status].label.toLowerCase();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-paper-300 bg-white/50 px-6 py-16 text-center dark:border-ink-800 dark:bg-ink-900/40">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
        <GraduationCap size={22} />
      </span>
      <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
        No {label} courses yet
      </p>
      {status === "ACTIVE" && (
        <Link
          to="/"
          className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
        >
          Explore courses
        </Link>
      )}
    </div>
  );
}
