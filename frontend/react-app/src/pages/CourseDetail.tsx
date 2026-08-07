import { useParams, Link } from "react-router-dom";
import { CheckCircle2, ListChecks } from "lucide-react";
import { AppNavbar } from "../AppNavbar";
import { useCourseDetail } from "../features/courses/hooks/useCourseDetail";
import { LEVEL_META } from "../features/courses/constants";
import { RatingStars } from "../features/courses/components/RatingStars";
import { CourseCurriculum } from "../features/courses/components/CourseCurriculum";
import { CourseSidebar } from "../features/courses/components/CourseSidebar";
import { resolveMediaUrl } from "../lib/media";
import { getYouTubeEmbedUrl } from "../lib/Youtube";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { course, isLoading, error } = useCourseDetail(id);

  return (
    <>
      <AppNavbar />

      {isLoading && (
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="h-64 animate-pulse rounded-xl bg-paper-100 dark:bg-ink-900" />
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        </div>
      )}

      {!isLoading && !error && course && id && (
        <CourseDetailBody courseId={id} course={course} />
      )}
    </>
  );
}

function CourseDetailBody({
  courseId,
  course,
}: {
  courseId: string;
  course: NonNullable<ReturnType<typeof useCourseDetail>["course"]>;
}) {
  const instructorPhotoUrl = resolveMediaUrl(course.instructor.photo);
  const instructorName = `${course.instructor.first_name} ${course.instructor.last_name}`.trim();
  const levelMeta = LEVEL_META[course.level];
  const embedUrl = getYouTubeEmbedUrl(course.intro_video);

  // requirements/what_included come back as plain text — split on newlines
  // if present, otherwise on commas, so either backend formatting renders as a list
  const splitList = (text: string) =>
    (text.includes("\n") ? text.split("\n") : text.split(","))
      .map((item) => item.trim())
      .filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-paper-200 bg-paper-100/60 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium dark:bg-ink-800 ${levelMeta.className}`}
          >
            <levelMeta.icon size={13} />
            {levelMeta.label}
          </span>

          <h1 className="mt-3 max-w-3xl font-display text-3xl italic leading-tight text-ink-950 dark:text-paper-50 sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-2 max-w-2xl text-ink-600 dark:text-ink-300">{course.subtitle}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingStars
              rating={Number.parseFloat(course.average_rating)}
              count={course.rating_count}
            />
            <Link
              to="#" // instructor profile page doesn't exist yet
              className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300"
            >
              {instructorPhotoUrl ? (
                <img src={instructorPhotoUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-800 text-[10px] font-semibold text-paper-50 dark:bg-ember-400 dark:text-ink-950">
                  {instructorName.charAt(0) || "?"}
                </span>
              )}
              {instructorName}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Main content */}
        <div className="flex flex-col gap-10 lg:col-span-2">
          {embedUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-ink-950">
              <iframe
                src={embedUrl}
                title="Course introduction video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <section>
            <h2 className="mb-2 text-lg font-semibold text-ink-950 dark:text-paper-50">
              About this course
            </h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {course.description}
            </p>
          </section>

          {course.what_included && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-ink-950 dark:text-paper-50">
                What's included
              </h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {splitList(course.what_included).map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-teal-500 dark:text-teal-400"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.requirements && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-ink-950 dark:text-paper-50">
                Requirements
              </h2>
              <ul className="flex flex-col gap-2">
                {splitList(course.requirements).map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200">
                    <ListChecks size={16} className="mt-0.5 shrink-0 text-ink-400 dark:text-ink-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <CourseCurriculum modules={course.modules} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <CourseSidebar courseId={courseId} course={course} />
        </div>
      </div>
    </>
  );
}