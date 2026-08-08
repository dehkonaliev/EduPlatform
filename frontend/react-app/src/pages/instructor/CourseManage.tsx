import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Edit3,
  FileText,
  HelpCircle,
  Layers,
  Loader2,
  PlayCircle,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { COURSE_STATUS_META, LESSON_TYPE_LABEL } from "../../features/courses/constants";
import { resolveMediaUrl } from "../../lib/media";
import { parseApiError } from "../../lib/api/parseApiError";
import { useToast } from "../../providers/ToastProvider";
import { cn } from "../../lib/utils";
import type { CourseDetail } from "../../features/courses/types";

type PendingDelete =
  | { kind: "course" }
  | { kind: "module"; id: string }
  | { kind: "lesson"; id: string }
  | null;

export default function CourseManagePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleting, setDeleting] = useState(false);

  const reloadCourse = useCallback(() => {
    if (!courseId) return Promise.resolve();
    return coursesApi
      .fetchCourseDetail(courseId)
      .then((data) => setCourse(data))
      .catch((err) => setError(parseApiError(err).generalMessage));
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    coursesApi
      .fetchCourseDetail(courseId)
      .then((data) => {
        if (!cancelled) setCourse(data);
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err).generalMessage);
      });
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  function matchesPending(target: { kind: string; id?: string }): boolean {
    if (!pendingDelete) return false;
    if (pendingDelete.kind !== target.kind) return false;
    return pendingDelete.kind === "course" || pendingDelete.id === target.id;
  }

  async function handleDeleteCourse() {
    if (pendingDelete?.kind !== "course") {
      setPendingDelete({ kind: "course" });
      return;
    }
    if (deleting || !courseId) return;
    setDeleting(true);
    try {
      await coursesApi.deleteCourse(courseId);
      showToast("Course deleted.");
      navigate("/instructor/courses");
    } catch (err) {
      setError(parseApiError(err).generalMessage);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (pendingDelete?.kind !== "module" || pendingDelete.id !== moduleId) {
      setPendingDelete({ kind: "module", id: moduleId });
      return;
    }
    if (deleting) return;
    setDeleting(true);
    try {
      await coursesApi.deleteModule(moduleId);
      setPendingDelete(null);
      showToast("Module deleted.");
      await reloadCourse();
    } catch (err) {
      setError(parseApiError(err).generalMessage);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteLesson(lessonId: string) {
    if (pendingDelete?.kind !== "lesson" || pendingDelete.id !== lessonId) {
      setPendingDelete({ kind: "lesson", id: lessonId });
      return;
    }
    if (deleting) return;
    setDeleting(true);
    try {
      await coursesApi.deleteLesson(lessonId);
      setPendingDelete(null);
      showToast("Lesson deleted.");
      await reloadCourse();
    } catch (err) {
      setError(parseApiError(err).generalMessage);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const thumbnailUrl = course ? resolveMediaUrl(course.thumbnail) : null;
  const moduleCount = course?.modules.length ?? 0;
  const lessonCount = course?.modules.reduce((sum, module) => sum + module.lessons.length, 0) ?? 0;

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {!course && !error ? (
          <div className="flex justify-center py-16 text-ink-500 dark:text-ink-300">
            <Loader2 size={24} className="animate-spin" />
          </div>
        ) : (
          course && (
            <>
              {/* Course header */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-paper-200 bg-ink-100 dark:border-ink-800 dark:bg-ink-800">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-xl italic text-ember-300">
                        {course.title.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="min-w-0 truncate font-display text-2xl italic text-ink-950 dark:text-paper-50">
                        {course.title}
                      </h1>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          COURSE_STATUS_META[course.status].badgeClassName
                        }`}
                      >
                        {COURSE_STATUS_META[course.status].label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
                      {moduleCount} module{moduleCount === 1 ? "" : "s"} · {lessonCount} lesson
                      {lessonCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    to={`/instructor/course/${courseId}/edit`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 px-4 py-2 text-sm font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
                  >
                    <Settings2 size={14} />
                    Edit course
                  </Link>
                  <Link
                    to={`/instructor/module-create?course=${courseId}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
                  >
                    <Plus size={15} />
                    Add module
                  </Link>
                  <button
                    type="button"
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                      matchesPending({ kind: "course" })
                        ? "border-red-300 bg-red-500/10 text-red-700 dark:border-red-500/40 dark:text-red-400"
                        : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10",
                    )}
                  >
                    {deleting && matchesPending({ kind: "course" }) ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    {matchesPending({ kind: "course" })
                      ? deleting
                        ? "Deleting…"
                        : "Confirm delete?"
                      : "Delete course"}
                  </button>
                </div>
              </div>

              {/* Curriculum */}
              <div className="mt-8 flex flex-col gap-4">
                {course.modules.length === 0 && (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-paper-300 bg-white/50 px-6 py-16 text-center dark:border-ink-800 dark:bg-ink-900/40">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                      <Layers size={22} />
                    </span>
                    <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
                      No modules yet
                    </p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      Add a module to start building the curriculum.
                    </p>
                  </div>
                )}

                {course.modules.map((module) => (
                  <div
                    key={module.id}
                    className="overflow-hidden rounded-xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-paper-100 px-4 py-3 dark:border-ink-800">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ember-400/15 text-ember-600 dark:text-ember-300">
                          <Layers size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500 dark:text-ink-300">
                            Module {module.order}
                          </p>
                          <p className="truncate text-sm font-semibold text-ink-950 dark:text-paper-50">
                            {module.title}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Link
                          to={`/instructor/lesson-create?course=${courseId}&module=${module.id}`}
                          className="inline-flex items-center gap-1 rounded-full border border-paper-200 px-3 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
                        >
                          <Plus size={13} />
                          Add lesson
                        </Link>
                        <Link
                          to={`/instructor/module/${module.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-full border border-paper-200 px-3 py-1.5 text-xs font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
                        >
                          <Edit3 size={13} />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(module.id)}
                          disabled={deleting}
                          title="Delete this module and all its lessons"
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                            matchesPending({ kind: "module", id: module.id })
                              ? "border-red-300 bg-red-500/10 text-red-700 dark:border-red-500/40 dark:text-red-400"
                              : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10",
                          )}
                        >
                          <Trash2 size={13} />
                          {matchesPending({ kind: "module", id: module.id })
                            ? deleting
                              ? "Deleting…"
                              : "Sure?"
                            : "Delete"}
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-paper-100 dark:divide-ink-800">
                      {module.lessons.length === 0 ? (
                        <p className="px-4 py-4 text-xs text-ink-500 dark:text-ink-400">
                          No lessons yet — add the first one.
                        </p>
                      ) : (
                        module.lessons.map((lesson) => {
                          const isQuizLesson =
                            lesson.lesson_type === "QUIZ" || lesson.lesson_type === "ASSIGNMENT";
                          const lessonEditUrl = `/instructor/lesson/${lesson.id}/edit`;
                          return (
                            <div
                              key={lesson.id}
                              className="group flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-paper-50 dark:hover:bg-ink-800/60"
                            >
                              <Link
                                to={lessonEditUrl}
                                className="flex min-w-0 flex-1 items-center gap-2.5"
                              >
                                {lesson.lesson_type === "VIDEO" ? (
                                  <PlayCircle
                                    size={15}
                                    className="shrink-0 text-ink-400 dark:text-ink-300"
                                  />
                                ) : (
                                  <FileText
                                    size={15}
                                    className="shrink-0 text-ink-400 dark:text-ink-300"
                                  />
                                )}
                                <span className="truncate text-sm text-ink-800 dark:text-paper-100">
                                  {lesson.title}
                                </span>
                                {lesson.is_preview && (
                                  <span className="shrink-0 rounded-full bg-ember-400/15 px-2 py-0.5 text-[10px] font-semibold text-ember-700 dark:text-ember-300">
                                    Preview
                                  </span>
                                )}
                              </Link>
                              <div className="flex shrink-0 items-center gap-2">
                                {isQuizLesson && (
                                  <Link
                                    to={`/instructor/quiz-create?course=${courseId}&module=${module.id}&lesson=${lesson.id}`}
                                    className="inline-flex items-center gap-1 rounded-full border border-paper-200 px-2.5 py-1 text-[11px] font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
                                  >
                                    <HelpCircle size={12} />
                                    Quiz
                                  </Link>
                                )}
                                <span className="text-xs text-ink-500 dark:text-ink-300">
                                  {LESSON_TYPE_LABEL[lesson.lesson_type]}
                                </span>
                                <span className="text-xs text-ink-500 dark:text-ink-300">
                                  {lesson.duration_minutes}m
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  disabled={deleting}
                                  aria-label="Delete lesson"
                                  title="Delete this lesson"
                                  className={cn(
                                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                                    matchesPending({ kind: "lesson", id: lesson.id })
                                      ? "bg-red-500/10 text-red-700 dark:text-red-400"
                                      : "text-ink-400 hover:bg-paper-100 hover:text-red-600 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-red-400",
                                  )}
                                >
                                  <Trash2 size={13} />
                                  {matchesPending({ kind: "lesson", id: lesson.id }) && "Sure?"}
                                </button>
                                <ChevronRight
                                  size={14}
                                  className="text-ink-400 dark:text-ink-300"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-6 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
              >
                ← Back
              </button>
            </>
          )
        )}
      </main>
    </>
  );
}
