import { Link } from "react-router-dom";
import { resolveMediaUrl } from "../../../lib/media";
import { LEVEL_META } from "../constants";
import { RatingStars } from "./RatingStars";
import type { CourseSummary } from "../types";

interface CourseCardProps {
  course: CourseSummary;
}

export function CourseCard({ course }: CourseCardProps) {
  const thumbnailUrl = resolveMediaUrl(course.thumbnail);
  const instructorPhotoUrl = resolveMediaUrl(course.instructor.photo);
  const rating = Number.parseFloat(course.average_rating);
  const levelMeta = LEVEL_META[course.level];

  return (
    <Link
      to={`/courses/${course.id}`}
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
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-medium text-paper-50 backdrop-blur-sm">
          <levelMeta.icon size={11} />
          {levelMeta.label}
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
          <RatingStars rating={rating} count={course.rating_count} size={11} />
        )}
      </div>
    </Link>
  );
}