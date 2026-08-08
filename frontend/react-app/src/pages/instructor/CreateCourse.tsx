import { useNavigate } from "react-router-dom";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { CourseForm, EMPTY_COURSE_FORM } from "./CourseForm";

export default function CreateCoursePage() {
  const navigate = useNavigate();

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
          Create Course
        </h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
          Fill in the basics — you can add modules and lessons right after.
        </p>

        <div className="mt-8">
          <CourseForm
            initial={EMPTY_COURSE_FORM}
            onCancel={() => navigate(-1)}
            onSubmit={async (payload) => {
              const created = await coursesApi.createCourse(payload);
              navigate(`/instructor/module-create?course=${created.id}`);
            }}
          />
        </div>
      </main>
    </>
  );
}
