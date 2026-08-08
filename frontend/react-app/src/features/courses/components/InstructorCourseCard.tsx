import { Link } from "react-router-dom";
import { Edit3, Settings2 } from "lucide-react";
import { resolveMediaUrl } from "../../../lib/media";
import { COURSE_STATUS_META, LEVEL_META } from "../constants";
import type { CourseSummary } from "../types";

interface InstructorCourseCardProps {
  course: CourseSummary;
}

/** Instructor-facing course card: shows the publishing status badge and links
 * to manage (curriculum) and edit (basics) instead of the student detail. */
export function InstructorCourseCard({ course }: InstructorCourseCardProps) {
  const thumbnailUrl = resolveMediaUrl(course.thumbnail);
  const levelMeta = LEVEL_META[course.level];
  const statusMeta = COURSE_STATUS_META[course.status];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-paper-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink-950/5 dark:border-ink-800 dark:bg-ink-900 dark:hover:shadow-black/20">
      <div className="relative aspect-video w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
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
        <span
          className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.badgeClassName}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-950 dark:text-paper-50">
          {course.title}
        </h3>
        <p className="line-clamp-1 text-xs text-ink-500 dark:text-ink-300">{course.subtitle}</p>

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            to={`/instructor/course/${course.id}/manage`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-3 py-2 text-xs font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
          >
            <Settings2 size={13} />
            Manage
          </Link>
          <Link
            to={`/instructor/course/${course.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-paper-200 px-3 py-2 text-xs font-semibold text-ink-800 transition-colors hover:bg-paper-100 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
          >
            <Edit3 size={13} />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}
