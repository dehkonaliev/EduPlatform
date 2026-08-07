import { useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { getYouTubeEmbedUrl } from "../../../lib/youtube";
import { LESSON_TYPE_ICON, LESSON_TYPE_LABEL, formatDuration } from "../../courses/constants";
import { QuizSolver } from "../../quizzes/components/QuizSolver";
import { LessonComplete } from "./LessonComplete";
import type { LessonDetail } from "../types";

export function LessonContent({ lesson }: { lesson: LessonDetail }) {
  const TypeIcon = LESSON_TYPE_ICON[lesson.lesson_type];
  const embedUrl = getYouTubeEmbedUrl(lesson.video_url);
  const isQuizLesson = lesson.lesson_type === "QUIZ" || lesson.lesson_type === "ASSIGNMENT";
  const [quizSolved, setQuizSolved] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-100 px-2.5 py-1 text-xs font-medium text-ink-700 dark:bg-ink-900 dark:text-ink-200">
            <TypeIcon size={13} />
            {LESSON_TYPE_LABEL[lesson.lesson_type]}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-100 px-2.5 py-1 text-xs text-ink-600 dark:bg-ink-900 dark:text-ink-300">
            <Clock size={13} />
            {formatDuration(lesson.duration_minutes)}
          </span>
          {lesson.is_preview && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-400">
              <Sparkles size={11} /> Preview
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-2xl italic leading-tight text-ink-950 dark:text-paper-50 sm:text-3xl">
          {lesson.title}
        </h1>
      </div>

      {/* Video lesson */}
      {lesson.lesson_type === "VIDEO" && embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-950 shadow-lg shadow-ink-950/10 dark:shadow-black/40">
          <iframe
            src={embedUrl}
            title={lesson.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Article / any lesson with written content */}
      {lesson.content && (
        <div className="whitespace-pre-line text-[15px] leading-relaxed text-ink-700 dark:text-ink-200">
          {lesson.content}
        </div>
      )}

      {/* Video without an embeddable URL */}
      {lesson.lesson_type === "VIDEO" && !embedUrl && (
        <div className="rounded-xl border border-dashed border-paper-300 bg-paper-100/60 px-6 py-10 text-center text-sm text-ink-500 dark:border-ink-800 dark:bg-ink-900/40 dark:text-ink-300">
          Video unavailable right now — please check back soon.
        </div>
      )}

      {/* Quiz / assignment — the quiz attached to this lesson */}
      {isQuizLesson && lesson.quiz && (
        <QuizSolver quizId={lesson.quiz} onSolved={() => setQuizSolved(true)} />
      )}

      {isQuizLesson && !lesson.quiz && (
        <div className="rounded-xl border border-dashed border-paper-300 bg-paper-100/60 px-6 py-10 text-center text-sm text-ink-500 dark:border-ink-800 dark:bg-ink-900/40 dark:text-ink-300">
          This {LESSON_TYPE_LABEL[lesson.lesson_type].toLowerCase()} hasn't been set up yet.
        </div>
      )}

      {/* Mark the lesson as complete (unlocks the next lesson) */}
      <LessonComplete lesson={lesson} disabled={isQuizLesson && !!lesson.quiz && !quizSolved} />
    </div>
  );
}
