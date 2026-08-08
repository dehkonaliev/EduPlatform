import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Send } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { COURSE_STATUS_META } from "../../features/courses/constants";
import { useCourseDetail } from "../../features/courses/hooks/useCourseDetail";
import { useToast } from "../../providers/ToastProvider";
import { resolveMediaUrl } from "../../lib/media";
import { parseApiError } from "../../lib/api/parseApiError";
import { CourseForm, type CourseFormValues } from "./CourseForm";
import type { CourseStatus } from "../../features/courses/types";

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { course, isLoading, error } = useCourseDetail(courseId ?? "");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  // Once sent, the local status moves to IN_REVIEW even though the hook's
  // cached course still says DRAFT/REJECTED.
  const [statusOverride, setStatusOverride] = useState<CourseStatus | null>(null);

  const status = statusOverride ?? course?.status;

  const initial: CourseFormValues | null = course
    ? {
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        category: course.category,
        tags: course.tags,
        level: course.level,
        language: course.language,
        pricingType: course.pricing_type,
        price: course.pricing_type === "FREE" ? "" : course.price,
        requirements: course.requirements,
        whatIncluded: course.what_included,
        introVideo: course.intro_video ?? "",
        thumbnailUrl: resolveMediaUrl(course.thumbnail),
      }
    : null;

  // Only drafts and rejected courses can be re-submitted for review.
  const canSendToReview = status === "DRAFT" || status === "REJECTED";

  async function handleSendToReview() {
    if (!courseId) return;
    setSendError(null);
    setIsSending(true);
    try {
      await coursesApi.sendCourseToReview(courseId);
      setStatusOverride("IN_REVIEW");
      showToast("Course sent to review.");
    } catch (err) {
      setSendError(parseApiError(err).generalMessage);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              Edit Course
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              Update the course basics, then manage its modules and lessons.
            </p>
          </div>

          {canSendToReview && (
            <button
              type="button"
              onClick={handleSendToReview}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 rounded-full bg-ember-400 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-ember-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              {isSending ? "Sending…" : "Send for review"}
            </button>
          )}
        </div>

        {status && (
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            Status:{" "}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                COURSE_STATUS_META[status].badgeClassName
              }`}
            >
              {COURSE_STATUS_META[status].label}
            </span>
          </p>
        )}

        {sendError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {sendError}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="mt-8">
          {!initial && isLoading && !error ? (
            <div className="flex justify-center py-16 text-ink-500 dark:text-ink-300">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : (
            initial && (
              <CourseForm
                key={courseId}
                initial={initial}
                submitLabel="Save changes"
                submitPendingLabel="Saving…"
                onCancel={() => navigate(-1)}
                onSubmit={async (payload) => {
                  await coursesApi.updateCourse(courseId!, payload);
                  showToast("Course saved.");
                  navigate(-1);
                }}
              />
            )
          )}
        </div>
      </main>
    </>
  );
}
