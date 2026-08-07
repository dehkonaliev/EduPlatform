import { CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useCompleteLesson } from "../hooks/useCompleteLesson";
import type { LessonDetail } from "../types";

interface LessonCompleteProps {
  lesson: LessonDetail;
  /** e.g. lock completion of a quiz lesson until the quiz has been solved. */
  disabled?: boolean;
}

/** Bottom-of-lesson action that marks the current lesson as complete via
 * POST /api/enrollments/lesson-progress/<uuid:pk>. Once the backend unlocks
 * the next lesson we navigate to it; when the course is finished we show a
 * completion banner instead. */
export function LessonComplete({ lesson, disabled = false }: LessonCompleteProps) {
  const { complete, isCompleting, error, result } = useCompleteLesson(lesson);

  // No progress record (preview lesson, or not enrolled) — nothing to complete.
  if (!lesson.progress_id) {
    if (lesson.progress_completed) return <CompletedBanner />;
    return null;
  }

  if (lesson.progress_completed) return <CompletedBanner />;

  if (result?.course_completed) {
    return (
      <div className="mt-8 rounded-xl border border-teal-500/30 bg-teal-500/5 p-6 text-center dark:border-teal-500/20">
        <PartyPopper className="mx-auto text-teal-600 dark:text-teal-400" size={28} />
        <h3 className="mt-2 font-display text-lg italic text-ink-950 dark:text-paper-50">
          Course completed!
        </h3>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Congratulations — you've finished every lesson in this course.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
      <p className="text-sm font-semibold text-ink-950 dark:text-paper-50">
        {disabled ? "Solve the quiz to unlock the next lesson" : "Finished with this lesson?"}
      </p>
      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
        Marking it complete unlocks the next lesson in the course.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={complete}
        disabled={disabled || isCompleting}
        className={cn(
          "mt-3 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
          "bg-teal-600 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40",
        )}
      >
        {isCompleting ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Completing…
          </>
        ) : (
          "Complete lesson"
        )}
      </button>
    </div>
  );
}

function CompletedBanner() {
  return (
    <div className="mt-8 flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/5 px-5 py-4 dark:border-teal-500/20">
      <CheckCircle2 size={18} className="text-teal-600 dark:text-teal-400" />
      <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
        Lesson completed
      </p>
    </div>
  );
}
