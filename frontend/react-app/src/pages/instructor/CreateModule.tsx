import { useNavigate, useSearchParams } from "react-router-dom";
import { Layers } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { useInstructorCourseOptions } from "../../features/courses/hooks/useInstructorCourseOptions";
import { EMPTY_MODULE_FORM, ModuleForm } from "./ModuleForm";

export default function CreateModulePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCourseId = searchParams.get("course") ?? "";

  const { courseOptions, isLoading, error } = useInstructorCourseOptions(presetCourseId);

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ember-400/15 text-ember-600 dark:text-ember-300">
            <Layers size={20} />
          </span>
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              Create Module
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              A module is a section of your course that groups lessons together.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ModuleForm
            courseOptions={courseOptions}
            isLoadingCourses={isLoading}
            initial={{ ...EMPTY_MODULE_FORM, course: presetCourseId }}
            onCancel={() => navigate(-1)}
            onSubmit={async (payload) => {
              const module = await coursesApi.createModule(payload);
              navigate(`/instructor/lesson-create?module=${module.id}&course=${payload.course}`);
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
