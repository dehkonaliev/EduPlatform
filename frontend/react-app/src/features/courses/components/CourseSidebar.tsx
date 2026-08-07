import { useState } from "react";
import { BarChart3, Loader2, ShoppingCart, Star, Users } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/media";
import { parseApiError } from "../../../lib/api/parseApiError";
import { useToast } from "../../../providers/ToastProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { enrollmentsApi } from "../../enrollments/api/enrollmentsApi";
import { paymentsApi } from "../../payments/api/paymentsApi";
import { cn } from "../../../lib/utils";
import type { CourseDetail } from "../types";

interface CourseSidebarProps {
  courseId: string;
  course: CourseDetail;
}

function formatPrice(course: CourseDetail): string {
  if (course.pricing_type === "FREE") return "Free";
  const amount = Number.parseFloat(course.price);
  const formatted = Number.isFinite(amount) ? amount.toFixed(2) : course.price;
  return course.pricing_type === "MONTHLY" ? `$${formatted}/mo` : `$${formatted}`;
}

export function CourseSidebar({ courseId, course }: CourseSidebarProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const thumbnailUrl = resolveMediaUrl(course.thumbnail);
  const isBuyFlow = course.pricing_type === "SPECIAL";

  async function handleClick() {
    if (!user) {
      showToast("Please sign in to continue.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      const message = isBuyFlow
        ? await paymentsApi.buyCourse(courseId)
        : await enrollmentsApi.enrollInCourse(courseId);
      setIsEnrolled(true);
      showToast(message || (isBuyFlow ? "Course purchased!" : "You're enrolled!"));
    } catch (err) {
      showToast(parseApiError(err).generalMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <aside className="sticky top-20 flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="relative aspect-video w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--color-ink-800), var(--color-ink-600))",
            }}
          >
            <span className="font-display text-4xl italic text-ember-300">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-5">
        <span className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
          {formatPrice(course)}
        </span>

        <button
          type="button"
          onClick={handleClick}
          disabled={isSubmitting || isEnrolled}
          className={cn(
            "flex items-center justify-center gap-2 rounded-full bg-ink-900 py-3 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70",
            "dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300",
          )}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {!isSubmitting && <ShoppingCart size={16} />}
          {isEnrolled ? "Enrolled" : isSubmitting ? "Please wait..." : isBuyFlow ? "Buy Course" : "Enroll Course"}
        </button>

        <div className="flex flex-col gap-2 border-t border-paper-200 pt-4 text-sm text-ink-600 dark:border-ink-800 dark:text-ink-300">
          <div className="flex items-center gap-2">
            <Users size={15} className="shrink-0 text-ink-400 dark:text-ink-500" />
            {course.total_enrollments} enrolled
          </div>
          <div className="flex items-center gap-2">
            <Star size={15} className="shrink-0 text-ink-400 dark:text-ink-500" />
            {course.rating_count > 0
              ? `${Number.parseFloat(course.average_rating).toFixed(1)} rating (${course.rating_count})`
              : "No ratings yet"}
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="shrink-0 text-ink-400 dark:text-ink-500" />
            {course.total_reviews} reviews
          </div>
        </div>
      </div>
    </aside>
  );
}