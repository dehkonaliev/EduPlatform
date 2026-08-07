import { useMemo } from "react";
import { useAuth } from "../providers/AuthProvider";
import { AppNavbar } from "../AppNavbar";
import { useCourseFeed } from "../features/courses/hooks/useCourseFeed";
import { CourseCard } from "../features/courses/components/CourseCard";
import { CourseCardSkeleton } from "../features/courses/components/CourseCardSkeleton";

const SKELETON_COUNT = 8;

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// One is picked at random per visit — enough variety that returning daily
// doesn't feel like reading the same static banner every time.
const RETURNING_LINES = [
  "Pick up the thread — a few more pages, a little more mastery.",
  "The lesson you left mid-sentence is still waiting for its ending.",
  "Ten focused minutes today is expertise, a little earlier than planned.",
  "Mastery is rarely dramatic. It's just today, done again.",
];

const ANONYMOUS_LINES = [
  "A library of ideas, waiting to be opened.",
  "Every course here begins with a single curious click.",
  "Taught by people who never stopped chasing the question either.",
  "Somewhere in here is the thing you didn't know you wanted to learn.",
];

export default function HomePage() {
  const { user } = useAuth();
  const { courses, isLoading, error } = useCourseFeed();

  const subtitle = useMemo(() => {
    const pool = user ? RETURNING_LINES : ANONYMOUS_LINES;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [user]);

  return (
    <>
      <AppNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-paper-200 bg-paper-100/60 dark:border-ink-800 dark:bg-ink-900/40">
        {/* Ghost serif ampersand — a quiet editorial flourish, echoes the display font */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-8 select-none font-display text-[11rem] italic leading-none text-ink-950/[0.04] dark:text-paper-50/[0.04] sm:text-[14rem]"
        >
          &
        </span>

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-600 dark:text-ember-400">
            {user ? getTimeGreeting() : "Curiosite"}
          </p>

          <h1 className="mt-3 font-display text-4xl italic leading-[1.1] text-ink-950 dark:text-paper-50 sm:text-5xl">
            {user ? (
              <>
                Welcome back, <span className="text-ember-500 dark:text-ember-400">{user.first_name}</span>.
              </>
            ) : (
              "Feed your curiosity."
            )}
          </h1>

          <div className="mt-5 h-px w-16 bg-ink-950/15 dark:bg-paper-50/15" />

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 dark:text-ink-300">
            {subtitle}
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-950 dark:text-paper-50">
            {user ? "Recommended for you" : "Explore courses"}
          </h2>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                  <CourseCardSkeleton key={index} />
                ))
              : courses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>
        )}

        {!isLoading && !error && courses.length === 0 && (
          <p className="py-16 text-center text-sm text-ink-500 dark:text-ink-300">
            No courses to show yet — check back soon.
          </p>
        )}
      </main>
    </>
  );
}