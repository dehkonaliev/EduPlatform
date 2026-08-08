import { useMemo, useState, type FormEvent } from "react";
import { Layers, Loader2 } from "lucide-react";
import { useToast } from "../../providers/ToastProvider";
import { parseApiError } from "../../lib/api/parseApiError";
import { cn } from "../../lib/utils";
import { Field, SelectInput, TextInput } from "./controls";
import type { ModuleCreatePayload } from "../../features/courses/types";

export interface ModuleFormValues {
  course: string;
  title: string;
  order: string;
}

export const EMPTY_MODULE_FORM: ModuleFormValues = { course: "", title: "", order: "1" };

interface ModuleFormProps {
  courseOptions: { value: string; label: string }[];
  isLoadingCourses?: boolean;
  initial?: ModuleFormValues;
  submitLabel?: string;
  submitPendingLabel?: string;
  onCancel?: () => void;
  onSubmit: (payload: ModuleCreatePayload) => Promise<void>;
}

/** Shared create/edit module form. Shows which course the module belongs to
 * (a context header that updates live) so you always know where you're
 * working. */
export function ModuleForm({
  courseOptions,
  isLoadingCourses = false,
  initial = EMPTY_MODULE_FORM,
  submitLabel = "Create module",
  submitPendingLabel = "Creating…",
  onCancel,
  onSubmit,
}: ModuleFormProps) {
  const { showToast } = useToast();
  const [courseId, setCourseId] = useState(initial.course);
  const [title, setTitle] = useState(initial.title);
  const [order, setOrder] = useState(initial.order);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCourseLabel = useMemo(
    () => courseOptions.find((option) => option.value === courseId)?.label ?? null,
    [courseOptions, courseId],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setGeneralError(null);

    const errors: Record<string, string> = {};
    if (!courseId) errors.course = "Select a course.";
    if (!title.trim()) errors.title = "Module title is required.";
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
      await onSubmit({ course: courseId, title: title.trim(), order: orderNumber });
      showToast(submitLabel === "Create module" ? "Module created." : "Module saved.");
    } catch (err) {
      const parsed = parseApiError(err);
      setFieldErrors(parsed.fieldErrors);
      const hasUnmappedError = Object.keys(parsed.fieldErrors).some(
        (key) => !["course", "title", "order"].includes(key),
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

      {/* Course context header — always visible so you know where this module goes. */}
      <div className="flex items-center gap-3 rounded-xl border border-paper-200 bg-paper-50 px-4 py-3 dark:border-ink-800 dark:bg-ink-900/60">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ember-400/15 text-ember-600 dark:text-ember-300">
          <Layers size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-500 dark:text-ink-300">
            Course
          </p>
          <p className="truncate text-sm font-semibold text-ink-950 dark:text-paper-50">
            {selectedCourseLabel ?? "Select a course below"}
          </p>
        </div>
      </div>

      <Field label="Course" htmlFor="course" error={fieldErrors.course}>
        <SelectInput
          id="course"
          value={courseId}
          onChange={(event) => setCourseId(event.target.value)}
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

      <Field label="Module title" htmlFor="title" error={fieldErrors.title}>
        <TextInput
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Getting started with Python"
          invalid={Boolean(fieldErrors.title)}
        />
      </Field>

      <Field
        label="Order"
        htmlFor="order"
        hint="Position in the course (1 = first)"
        error={fieldErrors.order}
      >
        <TextInput
          id="order"
          type="number"
          min="1"
          value={order}
          onChange={(event) => setOrder(event.target.value)}
          invalid={Boolean(fieldErrors.order)}
        />
      </Field>

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
          disabled={isSubmitting || isLoadingCourses}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
            "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
          )}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? submitPendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
