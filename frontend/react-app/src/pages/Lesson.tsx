import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ListVideo, X } from "lucide-react";
import { AppNavbar } from "../AppNavbar";
import { useLessonDetail } from "../features/lessons/hooks/useLessonDetail";
import { LessonSidebar } from "../features/lessons/components/LessonSidebar";
import { LessonContent } from "../features/lessons/components/LessonContent";
import { LessonPrevNext } from "../features/lessons/components/LessonPrevNext";
import { cn } from "../lib/utils";

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { lesson, isLoading, error } = useLessonDetail(lessonId);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <>
      <AppNavbar />

      {isLoading && (
        <div className="mx-auto flex w-full max-w-[1600px] animate-pulse">
          <div className="hidden w-80 shrink-0 border-r border-paper-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-950 lg:block">
            <div className="mb-4 h-4 w-2/3 rounded bg-paper-200 dark:bg-ink-800" />
            <div className="h-3 w-1/2 rounded bg-paper-200 dark:bg-ink-800" />
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-paper-200 dark:bg-ink-800" />
              <div className="h-3 w-full rounded bg-paper-200 dark:bg-ink-800" />
              <div className="h-3 w-3/4 rounded bg-paper-200 dark:bg-ink-800" />
            </div>
          </div>
          <div className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
            <div className="aspect-video w-full rounded-xl bg-ink-100 dark:bg-ink-900" />
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        </div>
      )}

      {!isLoading && !error && lesson && (
        <div className="mx-auto flex w-full max-w-[1600px] flex-col lg:flex-row">
          {/* Desktop sidebar */}
          <div className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
              <LessonSidebar curriculum={lesson.curriculum} activeLessonId={lesson.id} />
            </div>
          </div>

          {/* Mobile curriculum toggle */}
          <div className="border-b border-paper-200 px-4 py-3 dark:border-ink-800 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((open) => !open)}
              aria-expanded={mobileSidebarOpen}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-800 transition-colors hover:bg-paper-100 dark:text-paper-100 dark:hover:bg-ink-900"
            >
              {mobileSidebarOpen ? <X size={16} /> : <ListVideo size={16} />}
              {mobileSidebarOpen ? "Close curriculum" : "Course curriculum"}
              <ChevronDown
                size={14}
                className={cn("transition-transform", mobileSidebarOpen && "rotate-180")}
              />
            </button>
            {mobileSidebarOpen && (
              <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-paper-200 dark:border-ink-800">
                <LessonSidebar curriculum={lesson.curriculum} activeLessonId={lesson.id} />
              </div>
            )}
          </div>

          {/* Lesson */}
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <Link
              to="/my-learning"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 transition-colors hover:text-ember-600 dark:text-ink-300 dark:hover:text-ember-400"
            >
              <ArrowLeft size={15} />
              Back to My Learning
            </Link>
            <LessonContent lesson={lesson} />
            <LessonPrevNext curriculum={lesson.curriculum} activeLessonId={lesson.id} />
          </main>
        </div>
      )}
    </>
  );
}
