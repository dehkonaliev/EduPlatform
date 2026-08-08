import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, BookOpen, Loader2, Trash2 } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/media";
import { cn } from "../../../lib/utils";
import { useToast } from "../../../providers/ToastProvider";
import { LEVEL_META } from "../../courses/constants";
import { ENROLLMENT_STATUS_META } from "../constants";
import { useDropEnrollment } from "../hooks/useDropEnrollment";
import type { MyEnrollment } from "../types";

interface EnrollmentCardProps {
  enrollment: MyEnrollment;
  /** Called after the enrollment is dropped so the parent can refetch. */
  onDropped?: () => void | Promise<void>;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function EnrollmentCard({ enrollment, onDropped }: EnrollmentCardProps) {
  const { course } = enrollment;
  const thumbnailUrl = resolveMediaUrl(course.thumbnail);
  const instructorPhotoUrl = resolveMediaUrl(course.instructor.photo);
  const progress = Math.min(100, Math.max(0, Number.parseFloat(enrollment.progress_percentage) || 0));
  const progressRounded = Math.round(progress);
  const statusMeta = ENROLLMENT_STATUS_META[enrollment.status];
  const levelMeta = LEVEL_META[course.level];

  const canDrop = enrollment.status === "ACTIVE" || enrollment.status === "DEACTIVATED";

  // Resume where the student left off when the backend knows the lesson;
  // otherwise jump straight into the first lesson, or fall back to the
  // course page only when the course has no lessons at all.
  const continuePath = enrollment.last_accessed_lesson
    ? `/learn/${enrollment.last_accessed_lesson}`
    : enrollment.first_lesson
      ? `/learn/${enrollment.first_lesson}`
      : `/courses/${course.id}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-white transition-shadow duration-200 hover:shadow-lg hover:shadow-ink-950/5 dark:border-ink-800 dark:bg-ink-900 sm:flex-row">
      {/* Thumbnail */}
      <Link
        to={`/courses/${course.id}`}
        className="relative block aspect-video w-full shrink-0 overflow-hidden bg-ink-100 dark:bg-ink-800 sm:aspect-auto sm:w-60 lg:w-72"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-ink-800), var(--color-ink-600))",
            }}
          >
            <span className="font-display text-5xl italic text-ember-300">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-medium text-paper-50 backdrop-blur-sm">
          <levelMeta.icon size={11} />
          {levelMeta.label}
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-950 dark:text-paper-50">
              {course.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-ink-500 dark:text-ink-300">
              {course.subtitle}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${statusMeta.badgeClassName}`}
          >
            <statusMeta.icon size={11} />
            {statusMeta.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-1 text-xs text-ink-600 dark:text-ink-300">
          {instructorPhotoUrl ? (
            <img src={instructorPhotoUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
          ) : (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink-200 text-[9px] font-semibold text-ink-700 dark:bg-ink-700 dark:text-paper-100">
              {course.instructor.full_name.trim().charAt(0) || "?"}
            </span>
          )}
          <span className="truncate">{course.instructor.full_name.trim()}</span>
          <span className="mx-1 text-ink-300 dark:text-ink-600">·</span>
          <span>Enrolled {formatDate(enrollment.enrolled_at)}</span>
        </div>

        {/* Progress */}
        <div className="mt-auto flex flex-col gap-1 pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink-700 dark:text-ink-200">
              {progressRounded}% complete
            </span>
            {enrollment.completed_at && (
              <span className="text-teal-600 dark:text-teal-400">
                Completed {formatDate(enrollment.completed_at)}
              </span>
            )}
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-200 dark:bg-ink-800">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3">
          <Link
            to={continuePath}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-1.5 text-xs font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
          >
            <BookOpen size={13} />
            {enrollment.last_accessed_lesson ? "Continue learning" : "Start learning"}
            <ArrowRight size={13} />          </Link>
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-paper-200 px-3.5 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            Course page
          </Link>
          {canDrop && (
            <DropCourseButton enrollmentId={enrollment.id} onDropped={onDropped} />
          )}
        </div>
      </div>
    </div>
  );
}

function DropCourseButton({
  enrollmentId,
  onDropped,
}: {
  enrollmentId: string;
  onDropped?: EnrollmentCardProps["onDropped"];
}) {
  const [confirming, setConfirming] = useState(false);
  const { drop, isDropping, error } = useDropEnrollment();
  const { showToast } = useToast();

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), 4000);
      return;
    }
    const ok = await drop(enrollmentId);
    setConfirming(false);
    if (ok) {
      showToast("Course dropped");
      await onDropped?.();
    }
  }

  return (
    <div className="ml-auto flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDropping}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          confirming
            ? "border-red-300 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:border-red-500/30 dark:text-red-400"
            : "border-paper-200 text-ink-500 hover:border-red-300 hover:text-red-600 dark:border-ink-800 dark:text-ink-300 dark:hover:border-red-500/30 dark:hover:text-red-400",
        )}
      >
        {isDropping ? (
          <Loader2 size={13} className="animate-spin" />
        ) : confirming ? (
          <AlertTriangle size={13} />
        ) : (
          <Trash2 size={13} />
        )}
        {isDropping ? "Dropping…" : confirming ? "Confirm drop?" : "Drop course"}
      </button>
      {error && <span className="text-[11px] text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
