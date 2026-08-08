import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, PlayCircle } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { useInstructorCourseOptions } from "../../features/courses/hooks/useInstructorCourseOptions";
import { parseApiError } from "../../lib/api/parseApiError";
import { LessonForm, type LessonFormValues } from "./LessonForm";

export default function EditLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<LessonFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presetCourseId = initial?.course ?? "";

  useEffect(() => {
    if (!lessonId) return;
    let cancelled = false;
    coursesApi
      .fetchLessonDetail(lessonId)
      .then((lesson) => {
        if (cancelled) return;
        setInitial({
          course: lesson.module.course,
          module: lesson.module.id,
          title: lesson.title,
          lessonType: lesson.lesson_type,
          videoUrl: lesson.video_url ?? "",
          content: lesson.content ?? "",
          duration: String(lesson.duration_minutes),
          order: String(lesson.order),
          isPreview: lesson.is_preview,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err).generalMessage);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const { courseOptions, isLoading: isLoadingCourses } =
    useInstructorCourseOptions(presetCourseId);

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ember-400/15 text-ember-600 dark:text-ember-300">
            <PlayCircle size={20} />
          </span>
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              Edit Lesson
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              Update the lesson content, type, or ordering.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="mt-8">
          {!initial && !error ? (
            <div className="flex justify-center py-16 text-ink-500 dark:text-ink-300">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : (
            initial && (
              <LessonForm
                key={lessonId}
                courseOptions={courseOptions}
                isLoadingCourses={isLoadingCourses}
                fetchModules={(courseId) =>
                  coursesApi.fetchCourseDetail(courseId).then((course) => course.modules)
                }
                initial={initial}
                submitLabel="Save changes"
                submitPendingLabel="Saving…"
                onCancel={() => navigate(-1)}
                onSubmit={async (payload) => {
                  await coursesApi.updateLesson(lessonId!, payload);
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
