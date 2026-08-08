import { useNavigate, useSearchParams } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { useInstructorCourseOptions } from "../../features/courses/hooks/useInstructorCourseOptions";
import { EMPTY_LESSON_FORM, LessonForm } from "./LessonForm";

export default function CreateLessonPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCourseId = searchParams.get("course") ?? "";
  const presetModuleId = searchParams.get("module") ?? "";

  const { courseOptions, isLoading, error } = useInstructorCourseOptions(presetCourseId);

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
              Create Lesson
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              A lesson lives inside a module — video, article, quiz or assignment.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <LessonForm
            courseOptions={courseOptions}
            isLoadingCourses={isLoading}
            fetchModules={(courseId) =>
              coursesApi.fetchCourseDetail(courseId).then((course) => course.modules)
            }
            initial={{ ...EMPTY_LESSON_FORM, course: presetCourseId, module: presetModuleId }}
            onCancel={() => navigate(-1)}
            onSubmit={async (payload) => {
              await coursesApi.createLesson(payload);
            }}
          />
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </main>
    </>
  );
}
