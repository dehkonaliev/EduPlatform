import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FileText, HelpCircle, Loader2, PlayCircle } from "lucide-react";
import { useToast } from "../../providers/ToastProvider";
import { parseApiError } from "../../lib/api/parseApiError";
import { cn } from "../../lib/utils";
import { Field, SelectInput, TextArea, TextInput } from "./controls";
import type { CourseModule, LessonCreatePayload, LessonType } from "../../features/courses/types";

const LESSON_TYPES: { value: LessonType; label: string }[] = [
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Article" },
  { value: "QUIZ", label: "Quiz" },
  { value: "ASSIGNMENT", label: "Assignment" },
];

export interface LessonFormValues {
  course: string;
  module: string;
  title: string;
  lessonType: LessonType;
  videoUrl: string;
  content: string;
  duration: string;
  order: string;
  isPreview: boolean;
}

export const EMPTY_LESSON_FORM: LessonFormValues = {
  course: "",
  module: "",
  title: "",
  lessonType: "VIDEO",
  videoUrl: "",
  content: "",
  duration: "",
  order: "1",
  isPreview: false,
};

interface LessonFormProps {
  courseOptions: { value: string; label: string }[];
  isLoadingCourses?: boolean;
  /** Loads the modules of the selected course (usually course-detail). */
  fetchModules: (courseId: string) => Promise<CourseModule[]>;
  initial?: LessonFormValues;
  submitLabel?: string;
  submitPendingLabel?: string;
  onCancel?: () => void;
  onSubmit: (payload: LessonCreatePayload) => Promise<void>;
}

/** Shared create/edit lesson form. Shows which course + module the lesson
 * belongs to in a context header, and preloads the modules of the selected
 * course into the Module dropdown. */
export function LessonForm({
  courseOptions,
  isLoadingCourses = false,
  fetchModules,
  initial = EMPTY_LESSON_FORM,
  submitLabel = "Create lesson",
  submitPendingLabel = "Creating…",
  onCancel,
  onSubmit,
}: LessonFormProps) {
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState(initial.course);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [moduleId, setModuleId] = useState(initial.module);
  const keepPresetModule = useRef(true);

  const [title, setTitle] = useState(initial.title);
  const [lessonType, setLessonType] = useState<LessonType>(initial.lessonType);
  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [content, setContent] = useState(initial.content);
  const [duration, setDuration] = useState(initial.duration);
  const [order, setOrder] = useState(initial.order);
  const [isPreview, setIsPreview] = useState(initial.isPreview);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCourseLabel = useMemo(
    () => courseOptions.find((option) => option.value === courseId)?.label ?? null,
    [courseOptions, courseId],
  );
  const selectedModuleLabel = useMemo(
    () => modules.find((module) => module.id === moduleId)?.title ?? null,
    [modules, moduleId],
  );

  // Load modules whenever the course changes; on the very first load keep the
  // preset module (edit mode), otherwise pick the first module.
  useEffect(() => {
    if (!courseId) {
      setModules([]);
      setModuleId("");
      return;
    }
    let cancelled = false;
    setIsLoadingModules(true);
    fetchModules(courseId)
      .then((data) => {
        if (cancelled) return;
        setModules(data);
        const presetStillExists = data.some((module) => module.id === initial.module);
        if (keepPresetModule.current && presetStillExists) {
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
    // initial.module is only meaningful on mount (edit prefill).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, fetchModules]);

  function handleCourseChange(nextCourseId: string) {
    setCourseId(nextCourseId);
    setModuleId("");
    keepPresetModule.current = false;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (!courseId) errors.course = "Select a course.";
    if (!moduleId) errors.module = "Select a module.";
    if (!title.trim()) errors.title = "Lesson title is required.";
    if (lessonType === "VIDEO" && !videoUrl.trim())
      errors.video_url = "A video URL is required for video lessons.";
    if (lessonType === "ARTICLE" && !content.trim())
      errors.content = "Content is required for article lessons.";
    const durationNumber = Number(duration);
    if (!duration || Number.isNaN(durationNumber) || durationNumber <= 0)
      errors.duration_minutes = "Duration must be greater than 0.";
    const orderNumber = Number(order);
    if (!order || Number.isNaN(orderNumber) || orderNumber <= 0)
      errors.order = "Order must be greater than 0.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await onSubmit({
        module: moduleId,
        title: title.trim(),
        lesson_type: lessonType,
        video_url: lessonType === "VIDEO" ? videoUrl.trim() : undefined,
        content: lessonType === "ARTICLE" ? content.trim() : undefined,
        duration_minutes: durationNumber,
        order: orderNumber,
        is_preview: isPreview,
      });
      showToast(submitLabel === "Create lesson" ? "Lesson created." : "Lesson saved.");
      if (submitLabel === "Create lesson") {
        // Keep course/module selected so the instructor can keep adding lessons.
        setTitle("");
        setVideoUrl("");
        setContent("");
        setFieldErrors({});
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      const hasUnmappedError = Object.keys(parsed.fieldErrors).some(
        (key) =>
          !["course", "module", "title", "lesson_type", "video_url", "content", "duration_minutes", "order", "is_preview"].includes(
            key,
          ),
      );
      if (hasUnmappedError || Object.keys(parsed.fieldErrors).length === 0) {
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
          <PlayCircle size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-500 dark:text-ink-300">
            {selectedCourseLabel ? selectedCourseLabel : "Select a course below"}
          </p>
          <p className="truncate text-sm font-semibold text-ink-950 dark:text-paper-50">
            {selectedModuleLabel ? `Module: ${selectedModuleLabel}` : "No module selected yet"}
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
          onChange={(event) => setModuleId(event.target.value)}
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

      <Field label="Lesson title" htmlFor="title" error={fieldErrors.title}>
        <TextInput
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Installing Python locally"
          invalid={Boolean(fieldErrors.title)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Lesson type" htmlFor="lessonType" error={fieldErrors.lesson_type}>
          <SelectInput
            id="lessonType"
            value={lessonType}
            onChange={(event) => setLessonType(event.target.value as LessonType)}
          >
            {LESSON_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field
          label="Duration (minutes)"
          htmlFor="duration"
          error={fieldErrors.duration_minutes}
        >
          <TextInput
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="10"
            invalid={Boolean(fieldErrors.duration_minutes)}
          />
        </Field>
        <Field label="Order" htmlFor="order" error={fieldErrors.order}>
          <TextInput
            id="order"
            type="number"
            min="1"
            value={order}
            onChange={(event) => setOrder(event.target.value)}
            invalid={Boolean(fieldErrors.order)}
          />
        </Field>
      </div>

      {lessonType === "VIDEO" ? (
        <Field
          label="Video URL"
          htmlFor="videoUrl"
          hint="YouTube or Vimeo link"
          error={fieldErrors.video_url}
        >
          <TextInput
            id="videoUrl"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://youtube.com/watch?v=…"
            invalid={Boolean(fieldErrors.video_url)}
          />
        </Field>
      ) : lessonType === "ARTICLE" ? (
        <Field label="Content" htmlFor="content" error={fieldErrors.content}>
          <TextArea
            id="content"
            rows={6}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write the article body here…"
            invalid={Boolean(fieldErrors.content)}
          />
        </Field>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-paper-300 bg-white/50 px-4 py-3.5 dark:border-ink-700 dark:bg-ink-900/40">
          <HelpCircle size={16} className="mt-0.5 shrink-0 text-ink-500 dark:text-ink-300" />
          <p className="text-sm text-ink-700 dark:text-ink-200">
            {lessonType === "QUIZ"
              ? "This lesson holds a quiz. After creating the lesson, open it and use “Add quiz” to build the questions and answers."
              : "This lesson holds an assignment. After creating the lesson, open it and use “Add quiz” to build the questions and answers."}
          </p>
        </div>
      )}

      <label className="flex items-center gap-2.5 text-sm text-ink-800 dark:text-paper-100">
        <input
          type="checkbox"
          checked={isPreview}
          onChange={(event) => setIsPreview(event.target.checked)}
          className="h-4 w-4 rounded border-paper-300 accent-ember-500"
        />
        Free preview lesson (visible before enrollment)
      </label>

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
        <button
          type="submit"
          disabled={isSubmitting || isLoadingModules}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
            "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
          )}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? submitPendingLabel : submitLabel}
        </button>
      </div>

      {modules.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <FileText size={13} />
          {modules.length} module{modules.length === 1 ? "" : "s"} in this course — pick one
          from the dropdown above.
        </div>
      )}
    </form>
  );
}
