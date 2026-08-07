import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import type { LessonCurriculum } from "../types";

interface LessonPrevNextProps {
  curriculum: LessonCurriculum;
  activeLessonId: string;
}

/** Flattens the curriculum into lesson order so Previous/Next mirrors the
 * course sequence (module by module, in order). */
export function LessonPrevNext({ curriculum, activeLessonId }: LessonPrevNextProps) {
  const lessons = curriculum.modules.flatMap((module) => module.lessons);
  const index = lessons.findIndex((lesson) => lesson.id === activeLessonId);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;

  return (
    <nav className="mt-10 grid gap-3 border-t border-paper-200 pt-6 dark:border-ink-800 sm:grid-cols-2">
      {prev ? (
        <Link
          to={`/learn/${prev.id}`}
          className="group flex flex-col gap-1 rounded-xl border border-paper-200 p-4 transition-colors hover:border-ember-400/50 dark:border-ink-800"
        >
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
            <ArrowLeft size={13} /> Previous
          </span>
          <span className="line-clamp-1 text-sm font-semibold text-ink-950 dark:text-paper-50">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}

      {next ? (
        <Link
          to={`/learn/${next.id}`}
          className="group flex flex-col gap-1 rounded-xl border border-paper-200 p-4 text-right transition-colors hover:border-ember-400/50 dark:border-ink-800"
        >
          <span className="flex items-center justify-end gap-1.5 text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">
            Next <ArrowRight size={13} />
          </span>
          <span className="line-clamp-1 text-sm font-semibold text-ink-950 dark:text-paper-50">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex flex-col gap-1 rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 text-right dark:border-teal-500/20">
          <span className="flex items-center justify-end gap-1.5 text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-400">
            <CheckCircle2 size={13} /> Course complete
          </span>
          <span className="text-sm text-ink-600 dark:text-ink-300">
            Congratulations — you've finished the last lesson!
          </span>
        </div>
      )}
    </nav>
  );
}
