import { useNavigate, useSearchParams } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { quizzesApi } from "../../features/quizzes/api/quizzesApi";
import { useInstructorCourseOptions } from "../../features/courses/hooks/useInstructorCourseOptions";
import { useToast } from "../../providers/ToastProvider";
import { EMPTY_QUIZ_FORM, QuizForm } from "./QuizForm";

export default function CreateQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCourseId = searchParams.get("course") ?? "";
  const presetModuleId = searchParams.get("module") ?? "";
  const presetLessonId = searchParams.get("lesson") ?? "";

  const { courseOptions, isLoading, error } = useInstructorCourseOptions(presetCourseId);
  const { showToast } = useToast();

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ember-400/15 text-ember-600 dark:text-ember-300">
            <HelpCircle size={20} />
          </span>
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              Create Quiz
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              Pick the quiz lesson, give the quiz a title, then add its questions
              and answers.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <QuizForm
            courseOptions={courseOptions}
            isLoadingCourses={isLoading}
            fetchModules={(courseId) =>
              coursesApi.fetchCourseDetail(courseId).then((course) => course.modules)
            }
            fetchLesson={(lessonId) => coursesApi.fetchLessonDetail(lessonId)}
            initial={{
              ...EMPTY_QUIZ_FORM,
              course: presetCourseId,
              module: presetModuleId,
              lesson: presetLessonId,
            }}
            onCancel={() => navigate(-1)}
            onSubmit={async (payload) => {
              const quiz = await quizzesApi.createQuiz(payload);
              showToast("Quiz created — now add your questions.");
              navigate(`/instructor/quiz/${quiz.id}`, { replace: true });
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
