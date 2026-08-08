import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Loader2 } from "lucide-react";
import { parseApiError } from "../../lib/api/parseApiError";
import { cn } from "../../lib/utils";
import { Field, SelectInput, TextInput } from "./controls";
import { LESSON_TYPE_LABEL } from "../../features/courses/constants";
import type { CourseModule, LessonDetail, LessonType } from "../../features/courses/types";
import type { CreateQuizPayload } from "../../features/quizzes/types";

const QUIZ_LESSON_TYPES: LessonType[] = ["QUIZ", "ASSIGNMENT"];

export interface QuizFormValues {
  course: string;
  module: string;
  lesson: string;
  title: string;
}

export const EMPTY_QUIZ_FORM: QuizFormValues = { course: "", module: "", lesson: "", title: "" };

interface QuizFormProps {
  courseOptions: { value: string; label: string }[];
  isLoadingCourses?: boolean;
  /** Loads the modules of the selected course (usually course-detail). */
  fetchModules: (courseId: string) => Promise<CourseModule[]>;
  /** Loads one lesson so we can tell whether it already has a quiz. */
  fetchLesson: (lessonId: string) => Promise<LessonDetail>;
  initial?: QuizFormValues;
  onCancel?: () => void;
  onSubmit: (payload: CreateQuizPayload) => Promise<void>;
}

/** Create-quiz form. Guides the instructor through course → module → lesson
 * (only QUIZ/ASSIGNMENT lessons are shown, since those are the only ones a
 * quiz can be attached to). If the chosen lesson already has a quiz it offers
 * a link to open the existing one instead of creating a duplicate. */
export function QuizForm({
  courseOptions,
  isLoadingCourses = false,
  fetchModules,
  fetchLesson,
  initial = EMPTY_QUIZ_FORM,
  onCancel,
  onSubmit,
}: QuizFormProps) {
  const [courseId, setCourseId] = useState(initial.course);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [moduleId, setModuleId] = useState(initial.module);
  const [lessonId, setLessonId] = useState(initial.lesson);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);

  const [title, setTitle] = useState(initial.title);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quizLessons = useMemo(() => {
    const module = modules.find((m) => m.id === moduleId);
    return (module?.lessons ?? []).filter((lesson) =>
      QUIZ_LESSON_TYPES.includes(lesson.lesson_type),
    );
  }, [modules, moduleId]);

  const selectedCourseLabel = useMemo(
    () => courseOptions.find((option) => option.value === courseId)?.label ?? null,
    [courseOptions, courseId],
  );
  const selectedModuleLabel = useMemo(
    () => modules.find((module) => module.id === moduleId)?.title ?? null,
    [modules, moduleId],
  );
  const selectedLessonLabel = useMemo(
    () => quizLessons.find((lesson) => lesson.id === lessonId)?.title ?? null,
    [quizLessons, lessonId],
  );

  // Load modules whenever the course changes; on the very first load keep the
  // preset module (edit/deep-link mode), otherwise pick the first module.
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setModuleId("");
      setLessonId("");
      setLessonDetail(null);
      return;
    }
    let cancelled = false;
    setIsLoadingModules(true);
    fetchModules(courseId)
      .then((data) => {
        if (cancelled) return;
        setModules(data);
        const presetStillExists = data.some((module) => module.id === initial.module);
        if (presetStillExists && initial.module) {
          setModuleId(initial.module);
        } else {
          setModuleId(data[0]?.id ?? "");
        }
      })
      .catch(() => {
        /* module list left empty; the submit will surface any real issue */
      })
      .finally(() => {
        if (!cancelled) setIsLoadingModules(false);
      });
    return () => {
      cancelled = true;
    };
    // initial.module is only meaningful on mount (preset).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, fetchModules]);

  // Pick the first quiz lesson when the module changes and none is selected yet.
  useEffect(() => {
    if (!lessonId && quizLessons.length > 0) {
      setLessonId(quizLessons[0].id);
    }
    // Only react to module changes; the lesson select drives its own fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, quizLessons.length]);

  // Load the lesson detail so we can detect an existing quiz.
  useEffect(() => {
    if (!lessonId) {
      setLessonDetail(null);
      return;
    }
    let cancelled = false;
    setIsLoadingLesson(true);
    fetchLesson(lessonId)
      .then((data) => {
        if (!cancelled) setLessonDetail(data);
      })
      .catch(() => {
        /* quiz detection skipped; the backend still guards duplicates */
      })
      .finally(() => {
        if (!cancelled) setIsLoadingLesson(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId, fetchLesson]);

  function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);
    setModuleId("");
    setLessonId("");
    setLessonDetail(null);
  }

  function handleModuleChange(nextModuleId: string) {
    setModuleId(nextModuleId);
    setLessonId("");
    setLessonDetail(null);
  }

  const existingQuizId = lessonDetail?.quiz ?? null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (!courseId) errors.course = "Select a course.";
    if (!moduleId) errors.module = "Select a module.";
    if (!lessonId) errors.lesson = "Select a quiz or assignment lesson.";
    if (!title.trim()) errors.title = "Quiz title is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({ title: title.trim(), lesson: lessonId });
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      if (Object.keys(parsed.fieldErrors).length === 0) {
        setGeneralError(parsed.generalMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {generalError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {generalError}
        </div>
      )}

      {/* Course + module context header */}
      <div className="flex items-center gap-3 rounded-xl border border-paper-200 bg-paper-50 px-4 py-3 dark:border-ink-800 dark:bg-ink-900/60">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember-400/15 text-ember-600 dark:text-ember-300">
          <HelpCircle size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-500 dark:text-ink-300">
            {selectedCourseLabel ? selectedCourseLabel : "Select a course below"}
          </p>
          <p className="truncate text-sm font-semibold text-ink-950 dark:text-paper-50">
            {selectedModuleLabel
              ? `Module: ${selectedModuleLabel}`
              : "No module selected yet"}
          </p>
        </div>
      </div>

      <Field label="Course" htmlFor="course" error={fieldErrors.course}>
        <SelectInput
          id="course"
          value={courseId}
          onChange={(event) => handleCourseChange(event.target.value)}
          disabled={isLoadingCourses}
          invalid={Boolean(fieldErrors.course)}
        >
          <option value="">Select a course</option>
          {courseOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field label="Module" htmlFor="module" error={fieldErrors.module}>
        <SelectInput
          id="module"
          value={moduleId}
          onChange={(event) => handleModuleChange(event.target.value)}
          disabled={!courseId || isLoadingModules}
          invalid={Boolean(fieldErrors.module)}
        >
          <option value="">
            {!courseId ? "Select a course first" : isLoadingModules ? "Loading modules…" : "Select a module"}
          </option>
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.title}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field
        label="Quiz lesson"
        htmlFor="lesson"
        hint="Only quiz and assignment lessons can hold a quiz."
        error={fieldErrors.lesson}
      >
        <SelectInput
          id="lesson"
          value={lessonId}
          onChange={(event) => setLessonId(event.target.value)}
          disabled={!moduleId || isLoadingModules}
          invalid={Boolean(fieldErrors.lesson)}
        >
          <option value="">
            {!moduleId
              ? "Select a module first"
              : isLoadingModules
                ? "Loading lessons…"
                : quizLessons.length === 0
                  ? "No quiz lessons in this module"
                  : "Select a lesson"}
          </option>
          {quizLessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title} · {LESSON_TYPE_LABEL[lesson.lesson_type]}
            </option>
          ))}
        </SelectInput>
      </Field>

      {moduleId && quizLessons.length === 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-paper-300 bg-white/50 px-4 py-3.5 dark:border-ink-700 dark:bg-ink-900/40">
          <HelpCircle size={16} className="mt-0.5 shrink-0 text-ink-500 dark:text-ink-300" />
          <p className="text-sm text-ink-700 dark:text-ink-200">
            This module has no quiz lessons yet.{" "}
            <Link
              to={`/instructor/lesson-create?course=${courseId}&module=${moduleId}`}
              className="font-semibold text-ember-600 underline-offset-2 hover:underline dark:text-ember-400"
            >
              Create a quiz lesson first
            </Link>{" "}
            — a quiz lives inside a quiz or assignment lesson.
          </p>
        </div>
      )}

      {lessonId && isLoadingLesson && (
        <div className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
          <Loader2 size={15} className="animate-spin" />
          Checking this lesson…
        </div>
      )}

      {existingQuizId ? (
        <div className="flex flex-col gap-3 rounded-xl border border-teal-500/30 bg-teal-500/5 px-4 py-4">
          <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
            This lesson already has a quiz
          </p>
          <p className="text-xs text-ink-600 dark:text-ink-300">
            A lesson can only hold one quiz. Open the existing one to add or edit
            its questions.
          </p>
          <Link
            to={`/instructor/quiz/${existingQuizId}`}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
          >
            <HelpCircle size={14} />
            Open quiz builder
          </Link>
        </div>
      ) : (
        <Field label="Quiz title" htmlFor="title" error={fieldErrors.title}>
          <TextInput
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={selectedLessonLabel ? `e.g. ${selectedLessonLabel} — knowledge check` : "e.g. Module 1 knowledge check"}
            invalid={Boolean(fieldErrors.title)}
          />
        </Field>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-paper-200 px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
          >
            Cancel
          </button>
        )}
        {!existingQuizId && (
          <button
            type="submit"
            disabled={isSubmitting || isLoadingLesson}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
              "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
            )}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Creating…" : "Create quiz"}
          </button>
        )}
      </div>
    </form>
  );
}
