import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, HelpCircle, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { coursesApi } from "../../features/courses/api/coursesApi";
import { quizzesApi } from "../../features/quizzes/api/quizzesApi";
import { QUESTION_TYPE_META, QUESTION_TYPE_OPTIONS } from "../../features/quizzes/constants";
import { useQuizDetail } from "../../features/quizzes/hooks/useQuizDetail";
import type { LessonDetail } from "../../features/courses/types";
import type { QuizOption, QuizQuestion, QuizQuestionType } from "../../features/quizzes/types";
import { parseApiError } from "../../lib/api/parseApiError";
import { useToast } from "../../providers/ToastProvider";
import { cn } from "../../lib/utils";
import { Field, SelectInput, TextInput } from "./controls";

interface LocalOption extends QuizOption {
  is_correct?: boolean;
}

interface LocalQuestion extends Omit<QuizQuestion, "options"> {
  options: LocalOption[];
}

interface OptionDraft {
  text: string;
  isCorrect: boolean;
}

export default function QuizBuilderPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { quiz, isLoading, error } = useQuizDetail(quizId);

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [titleDraft, setTitleDraft] = useState("");
  const [isSavingTitle, setIsSavingTitle] = useState(false);

  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<QuizQuestionType>("RADIO");
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const [optionDrafts, setOptionDrafts] = useState<Record<string, OptionDraft>>({});
  const [addingOptionFor, setAddingOptionFor] = useState<string | null>(null);

  const [pendingDeleteQuestion, setPendingDeleteQuestion] = useState<string | null>(null);
  const [pendingDeleteQuiz, setPendingDeleteQuiz] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Seed local question state from the fetched quiz (correct markers are only
  // known for options created during this session — the API hides them).
  useEffect(() => {
    if (!quiz) return;
    setQuestions(
      quiz.questions.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ ...o })),
      })),
    );
    setTitleDraft(quiz.title);
  }, [quiz]);

  // Resolve the lesson so we can show the course breadcrumb / back link.
  useEffect(() => {
    if (!quiz?.lesson) return;
    let cancelled = false;
    coursesApi
      .fetchLessonDetail(quiz.lesson)
      .then((data) => {
        if (!cancelled) setLesson(data);
      })
      .catch(() => {
        /* breadcrumb is optional */
      });
    return () => {
      cancelled = true;
    };
  }, [quiz?.lesson]);

  function setOptionDraft(questionId: string, draft: OptionDraft) {
    setOptionDrafts((prev) => ({ ...prev, [questionId]: draft }));
    setActionError(null);
  }

  async function handleSaveTitle() {
    if (!quiz || isSavingTitle) return;
    const title = titleDraft.trim();
    if (!title) {
      setActionError("Quiz title cannot be empty.");
      return;
    }
    setIsSavingTitle(true);
    try {
      await quizzesApi.updateQuizTitle(quiz.id, title);
      showToast("Quiz title saved.");
    } catch (err) {
      setActionError(parseApiError(err).generalMessage);
    } finally {
      setIsSavingTitle(false);
    }
  }

  async function handleAddQuestion(event: FormEvent) {
    event.preventDefault();
    if (!quiz || isAddingQuestion) return;
    const text = questionText.trim();
    if (!text) {
      setActionError("Question text is required.");
      return;
    }
    setIsAddingQuestion(true);
    try {
      const created = await quizzesApi.createQuestion({
        quiz: quiz.id,
        question: text,
        question_type: questionType,
      });
      setQuestions((prev) => [
        ...prev,
        { id: created.id, question: created.question, question_type: created.question_type, options: [] },
      ]);
      setQuestionText("");
      setActionError(null);
      showToast("Question added.");
    } catch (err) {
      setActionError(parseApiError(err).generalMessage);
    } finally {
      setIsAddingQuestion(false);
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    if (pendingDeleteQuestion !== questionId) {
      setPendingDeleteQuestion(questionId);
      return;
    }
    try {
      await quizzesApi.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setPendingDeleteQuestion(null);
      showToast("Question deleted.");
    } catch (err) {
      setActionError(parseApiError(err).generalMessage);
    }
  }

  async function handleDeleteQuiz() {
    if (!quiz || isDeletingQuiz) return;
    if (!pendingDeleteQuiz) {
      setPendingDeleteQuiz(true);
      return;
    }
    setIsDeletingQuiz(true);
    try {
      await quizzesApi.deleteQuiz(quiz.id);
      showToast("Quiz deleted.");
      if (courseId) {
        navigate(`/instructor/course/${courseId}/manage`);
      } else {
        navigate(-1);
      }
    } catch (err) {
      setActionError(parseApiError(err).generalMessage);
      setPendingDeleteQuiz(false);
    } finally {
      setIsDeletingQuiz(false);
    }
  }

  async function handleAddOption(question: LocalQuestion) {
    const draft = optionDrafts[question.id];
    const text = draft?.text.trim() ?? "";
    const isCorrect = question.question_type === "TEXT" ? true : Boolean(draft?.isCorrect);
    if (!text) {
      setActionError("Option text is required.");
      return;
    }
    if (
      question.question_type === "RADIO" &&
      isCorrect &&
      question.options.some((o) => o.is_correct === true)
    ) {
      setActionError(
        "Single-choice questions can only have one correct answer. Delete the current correct option first, or add this one as a wrong answer.",
      );
      return;
    }
    setAddingOptionFor(question.id);
    try {
      const created = await quizzesApi.createOption({
        question: question.id,
        option: text,
        is_correct: isCorrect,
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id
            ? {
                ...q,
                options: [
                  ...q.options,
                  { id: created.id, option: created.option, is_correct: created.is_correct },
                ],
              }
            : q,
        ),
      );
      setOptionDrafts((prev) => ({ ...prev, [question.id]: { text: "", isCorrect: false } }));
      setActionError(null);
      showToast(isCorrect ? "Option added and marked correct." : "Option added.");
    } catch (err) {
      setActionError(parseApiError(err).generalMessage);
    } finally {
      setAddingOptionFor(null);
    }
  }

  async function handleDeleteOption(questionId: string, optionId: string) {
    try {
      await quizzesApi.deleteOption(optionId);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
            : q,
        ),
      );
      setActionError(null);
      showToast("Option deleted.");
    } catch (err) {
      setActionError(parseApiError(err).generalMessage);
    }
  }

  const courseId = lesson?.module.course ?? null;
  const optionCount = questions.reduce((sum, q) => sum + q.options.length, 0);

  if (error) {
    return (
      <>
        <AppNavbar />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {error}
          </div>
        </main>
      </>
    );
  }

  if (isLoading || !quiz) {
    return (
      <>
        <AppNavbar />
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex justify-center py-16 text-ink-500 dark:text-ink-300">
            <Loader2 size={24} className="animate-spin" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppNavbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
          >
            ← Back
          </button>
          <div className="flex shrink-0 items-center gap-3">
            {courseId && (
              <Link
                to={`/instructor/course/${courseId}/manage`}
                className="text-sm font-medium text-ember-600 underline-offset-2 hover:underline dark:text-ember-400"
              >
                Back to course
              </Link>
            )}
            <button
              type="button"
              onClick={handleDeleteQuiz}
              disabled={isDeletingQuiz}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                pendingDeleteQuiz
                  ? "border-red-300 bg-red-500/10 text-red-700 dark:border-red-500/40 dark:text-red-400"
                  : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10",
              )}
            >
              {isDeletingQuiz ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              {pendingDeleteQuiz ? (isDeletingQuiz ? "Deleting…" : "Confirm delete?") : "Delete quiz"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ember-400/15 text-ember-600 dark:text-ember-300">
            <HelpCircle size={20} />
          </span>
          <div>
            <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
              Build Quiz
            </h1>
            <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
              {lesson ? `Lesson: ${lesson.title}` : "Quiz builder"} — add questions,
              then give each question its answer options.
            </p>
          </div>
        </div>

        {/* Quiz title */}
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-paper-200 bg-white p-4 sm:flex-row sm:items-end dark:border-ink-800 dark:bg-ink-950">
          <div className="sm:flex-1">
            <Field label="Quiz title" htmlFor="titleDraft">
              <TextInput
                id="titleDraft"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={handleSaveTitle}
            disabled={isSavingTitle || titleDraft.trim() === quiz.title}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-paper-200 px-4 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
          >
            {isSavingTitle ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {isSavingTitle ? "Saving…" : "Save title"}
          </button>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            {actionError}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
          <span className="rounded-full bg-paper-200 px-2.5 py-1 font-semibold dark:bg-ink-800">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-paper-200 px-2.5 py-1 font-semibold dark:bg-ink-800">
            {optionCount} option{optionCount === 1 ? "" : "s"}
          </span>
          <span className="ml-1 hidden sm:inline">
            Correct answers are saved instantly; the backend keeps them private so
            students can't peek.
          </span>
        </div>

        {/* Add question */}
        <section className="mt-6 rounded-xl border border-paper-200 bg-white p-4 dark:border-ink-800 dark:bg-ink-950">
          <h2 className="font-display text-lg italic text-ink-950 dark:text-paper-50">
            Add a question
          </h2>
          <form onSubmit={handleAddQuestion} className="mt-3 flex flex-col gap-3" noValidate>
            <Field label="Question" htmlFor="questionText">
              <TextInput
                id="questionText"
                value={questionText}
                onChange={(event) => {
                  setQuestionText(event.target.value);
                  setActionError(null);
                }}
                placeholder="e.g. What does HTTP stand for?"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field
                label="Question type"
                htmlFor="questionType"
                hint={QUESTION_TYPE_META[questionType].description}
              >
                <SelectInput
                  id="questionType"
                  value={questionType}
                  onChange={(event) => setQuestionType(event.target.value as QuizQuestionType)}
                >
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <button
                type="submit"
                disabled={isAddingQuestion || !questionText.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
              >
                {isAddingQuestion ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Plus size={15} />
                )}
                {isAddingQuestion ? "Adding…" : "Add question"}
              </button>
            </div>
          </form>
        </section>

        {/* Questions */}
        <div className="mt-6 flex flex-col gap-4">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-paper-300 bg-white/50 px-6 py-14 text-center dark:border-ink-800 dark:bg-ink-900/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                <HelpCircle size={22} />
              </span>
              <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
                No questions yet
              </p>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Add your first question above, then give it answer options.
              </p>
            </div>
          ) : (
            questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                draft={optionDrafts[question.id]}
                isAddingOption={addingOptionFor === question.id}
                pendingDelete={pendingDeleteQuestion === question.id}
                onOptionDraftChange={setOptionDraft}
                onAddOption={() => handleAddOption(question)}
                onDeleteOption={(optionId) => handleDeleteOption(question.id, optionId)}
                onDeleteQuestion={() => handleDeleteQuestion(question.id)}
              />
            ))
          )}
        </div>

        {courseId && (
          <div className="mt-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to={`/instructor/course/${courseId}/manage`}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
            >
              <Check size={15} />
              Done — back to course
            </Link>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Students take this quiz when they reach the lesson.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

function QuestionCard({
  question,
  index,
  draft,
  isAddingOption,
  pendingDelete,
  onOptionDraftChange,
  onAddOption,
  onDeleteOption,
  onDeleteQuestion,
}: {
  question: LocalQuestion;
  index: number;
  draft?: OptionDraft;
  isAddingOption: boolean;
  pendingDelete: boolean;
  onOptionDraftChange: (questionId: string, draft: OptionDraft) => void;
  onAddOption: () => void;
  onDeleteOption: (optionId: string) => void;
  onDeleteQuestion: () => void;
}) {
  const meta = QUESTION_TYPE_META[question.question_type];
  const isText = question.question_type === "TEXT";
  const isCheckbox = question.question_type === "CHECKBOX";
  const knownCorrectCount = question.options.filter((o) => o.is_correct === true).length;
  const draftText = draft?.text ?? "";
  const draftCorrect = draft?.isCorrect ?? false;

  return (
    <div className="rounded-xl border border-paper-200 bg-white dark:border-ink-800 dark:bg-ink-950">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-950 dark:text-paper-50">
              <span className="mr-1.5 text-ink-400 dark:text-ink-500">{index + 1}.</span>
              {question.question}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                meta.badgeClassName,
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{meta.description}</p>
        </div>
        <button
          type="button"
          onClick={onDeleteQuestion}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            pendingDelete
              ? "bg-red-500/10 text-red-700 dark:text-red-400"
              : "text-ink-500 hover:bg-paper-100 hover:text-red-600 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-red-400",
          )}
        >
          {pendingDelete ? (
            <>
              <Trash2 size={13} /> Sure?
            </>
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>

      {/* Options */}
      <div className="px-4 pt-3">
        {question.options.length === 0 ? (
          <p className="rounded-lg border border-dashed border-paper-300 px-3 py-2.5 text-xs text-ink-500 dark:border-ink-700 dark:text-ink-400">
            No options yet — add at least one.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {question.options.map((option) => {
              const isCorrect = option.is_correct === true;
              return (
                <li
                  key={option.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
                    isCorrect
                      ? "border-teal-500/40 bg-teal-500/5"
                      : "border-paper-200 dark:border-ink-800",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center border",
                      isCheckbox ? "rounded" : "rounded-full",
                      isCorrect
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-paper-300 dark:border-ink-600",
                    )}
                  >
                    {isCorrect && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span
                    className={cn(
                      "flex-1",
                      isCorrect
                        ? "font-medium text-teal-700 dark:text-teal-300"
                        : "text-ink-800 dark:text-paper-100",
                    )}
                  >
                    {option.option}
                  </span>
                  {isCorrect && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                      Correct
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onDeleteOption(option.id)}
                    aria-label="Delete option"
                    className="shrink-0 text-ink-400 transition-colors hover:text-red-600 dark:text-ink-300 dark:hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {question.question_type === "RADIO" && knownCorrectCount > 0 && (
          <p className="mt-2 text-[11px] text-ink-500 dark:text-ink-400">
            This question already has a correct answer — single-choice questions can
            only have one. Delete the correct option to pick a different one.
          </p>
        )}
      </div>

      {/* Add option */}
      <div className="border-t border-paper-100 px-4 py-3 dark:border-ink-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TextInput
            value={draftText}
            onChange={(event) =>
              onOptionDraftChange(question.id, {
                text: event.target.value,
                isCorrect: draftCorrect,
              })
            }
            placeholder={isText ? "Type the correct answer…" : "Add an option…"}
            className="sm:flex-1"
          />
          {!isText && (
            <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-ink-700 dark:text-ink-200">
              <input
                type="checkbox"
                checked={draftCorrect}
                onChange={(event) =>
                  onOptionDraftChange(question.id, {
                    text: draftText,
                    isCorrect: event.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-paper-300 accent-teal-500"
              />
              Correct answer
            </label>
          )}
          <button
            type="button"
            onClick={onAddOption}
            disabled={isAddingOption || !draftText.trim()}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-paper-200 px-4 py-2 text-sm font-semibold text-ink-800 transition-colors hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-ink-800 dark:text-paper-100 dark:hover:bg-ink-800"
          >
            {isAddingOption ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {isText ? "Set answer" : "Add option"}
          </button>
        </div>
        {isText && (
          <p className="mt-1.5 text-[11px] text-ink-500 dark:text-ink-400">
            Students type this exact answer (compared without case sensitivity). A
            short-answer question has one correct answer.
          </p>
        )}
      </div>
    </div>
  );
}
