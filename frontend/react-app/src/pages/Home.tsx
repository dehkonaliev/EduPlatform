import { useAuth } from "../providers/AuthProvider";
import { AppNavbar } from "../AppNavbar";
import { useCourseFeed } from "../features/courses/hooks/useCourseFeed";
import { CourseCard } from "../features/courses/components/CourseCard";
import { CourseCardSkeleton } from "../features/courses/components/CourseCardSkeleton";

const SKELETON_COUNT = 8;

export default function HomePage() {
  const { user } = useAuth();
  const { courses, isLoading, error } = useCourseFeed();

  return (
    <>
      <AppNavbar />

      {/* Hero */}
      <section className="border-b border-paper-200 bg-paper-100/60 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50 sm:text-4xl">
            {user ? `Welcome back, ${user.first_name}` : "Feed your curiosity"}
          </h1>
          <p className="mt-2 max-w-xl text-ink-600 dark:text-ink-300">
            {user
              ? "Pick up where you left off, or discover something new."
              : "Courses picked for you — sign in to make them even better."}
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