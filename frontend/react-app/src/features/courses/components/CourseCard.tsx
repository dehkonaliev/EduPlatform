import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/media";
import { cn } from "../../../lib/utils";
import type { CourseSummary } from "../types";

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

interface CourseCardProps {
  course: CourseSummary;
}

export function CourseCard({ course }: CourseCardProps) {
  const thumbnailUrl = resolveMediaUrl(course.thumbnail);
  const instructorPhotoUrl = resolveMediaUrl(course.instructor.photo);
  const rating = Number.parseFloat(course.average_rating);

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-950/5 dark:border-ink-800 dark:bg-ink-900 dark:hover:shadow-black/20"
    >
      {/* Thumbnail — falls back to a branded gradient + initial when null */}
      <div className="relative aspect-video w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-ink-800), var(--color-ink-600))",
            }}
          >
            <span className="font-display text-4xl italic text-ember-300">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-medium text-paper-50 backdrop-blur-sm">
          {LEVEL_LABEL[course.level] ?? course.level}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-950 dark:text-paper-50">
          {course.title}
        </h3>
        <p className="line-clamp-1 text-xs text-ink-500 dark:text-ink-300">{course.subtitle}</p>

        <div className="mt-auto flex items-center gap-1.5 pt-1.5 text-xs text-ink-600 dark:text-ink-300">
          {instructorPhotoUrl ? (
            <img src={instructorPhotoUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
          ) : (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ink-200 text-[9px] font-semibold text-ink-700 dark:bg-ink-700 dark:text-paper-100">
              {course.instructor.full_name.trim().charAt(0) || "?"}
            </span>
          )}
          <span className="truncate">{course.instructor.full_name.trim()}</span>
        </div>

        {course.rating_count > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-ember-600 dark:text-ember-400">
              {rating.toFixed(1)}
            </span>
            <div className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={11}
                  className={cn(
                    index < Math.round(rating)
                      ? "fill-ember-400 text-ember-400"
                      : "fill-transparent text-ink-300 dark:text-ink-600",
                  )}
                />
              ))}
            </div>
            <span className="text-ink-500 dark:text-ink-400">({course.rating_count})</span>
          </div>
        )}
      </div>
    </Link>
  );
}