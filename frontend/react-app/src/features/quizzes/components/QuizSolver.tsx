import { useState } from "react";
import { isAxiosError } from "axios";
import { Check, Loader2, Trophy } from "lucide-react";
import { cn } from "../../../lib/utils";
import { parseApiError } from "../../../lib/api/parseApiError";
import { useQuizDetail } from "../hooks/useQuizDetail";
import { quizzesApi } from "../api/quizzesApi";
import type { QuizAttemptResult, QuizQuestion } from "../types";

interface QuizSolverProps {
  quizId: string;
  /** Called once right after an attempt is successfully submitted. */
  onSolved?: () => void;
}

export function QuizSolver({ quizId, onSolved }: QuizSolverProps) {
  const { quiz, isLoading, error } = useQuizDetail(quizId);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  function setAnswer(questionId: string, value: string[]) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function toggleOption(question: QuizQuestion, optionId: string) {
    const current = answers[question.id] ?? [];
    if (question.question_type === "RADIO") {
      setAnswer(question.id, [optionId]);
      return;
    }
    setAnswer(
      question.id,
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  }

  function setTextAnswer(questionId: string, text: string) {
    setAnswer(questionId, [text]);
  }

  const answeredCount = quiz ? quiz.questions.filter((q) => (answers[q.id] ?? []).length > 0).length : 0;

  async function handleSubmit() {
    if (!quiz || isSubmitting) return;
    const response = quiz.questions.map((q) => ({
      question_id: q.id,
      selected_options: answers[q.id] ?? [],
    }));
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await quizzesApi.submitAttempt(quiz.id, response);
      setResult(res);
      onSolved?.();
    } catch (err) {
      setSubmitError(parseApiError(err).generalMessage);
      // Attempts exhausted — treat as "solved enough" so the student can still
      // finish the lesson instead of being locked out of it.
      if (isAxiosError(err) && err.response?.status === 403) {
        onSolved?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 rounded-xl border border-paper-200 p-6 dark:border-ink-800">
        <div className="h-5 w-1/3 rounded bg-paper-200 dark:bg-ink-800" />
        <div className="h-24 rounded bg-paper-200 dark:bg-ink-800" />
        <div className="h-24 rounded bg-paper-200 dark:bg-ink-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
      >
        {error}
      </div>
    );
  }

  if (!quiz) return null;

  if (result) {
    return (
      <ResultCard result={result} />
    );
  }

  const allAnswered = quiz.questions.length > 0 && answeredCount === quiz.questions.length;

  return (
    <div className="rounded-xl border border-paper-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg italic text-ink-950 dark:text-paper-50">
          {quiz.title}
        </h2>
        <span className="text-xs font-medium text-ink-500 dark:text-ink-400">
          {answeredCount} / {quiz.questions.length} answered
        </span>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            selected={answers[question.id] ?? []}
            onToggleOption={(optionId) => toggleOption(question, optionId)}
            onTextChange={(text) => setTextAnswer(question.id, text)}
          />
        ))}
      </div>

      {submitError && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {submitError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ember-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ember-600 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Checking answers…
          </>
        ) : (
          "Submit answers"
        )}
      </button>
    </div>
  );
}

function QuestionCard({
  index,
  question,
  selected,
  onToggleOption,
  onTextChange,
}: {
  index: number;
  question: QuizQuestion;
  selected: string[];
  onToggleOption: (optionId: string) => void;
  onTextChange: (text: string) => void;
}) {
  const isText = question.question_type === "TEXT";
  const isCheckbox = question.question_type === "CHECKBOX";

  return (
    <div className="rounded-xl border border-paper-200 p-4 dark:border-ink-800">
      <p className="text-sm font-semibold text-ink-950 dark:text-paper-50">
        <span className="mr-2 text-ink-400 dark:text-ink-500">{index + 1}.</span>
        {question.question}
      </p>

      {isText ? (
        <input
          type="text"
          value={selected[0] ?? ""}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Type your answer…"
          className="mt-3 w-full rounded-lg border border-paper-200 bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-400 focus:border-ember-400 dark:border-ink-800 dark:bg-ink-950 dark:text-paper-50"
        />
      ) : (
        <div className="mt-3 space-y-2">
          {question.options.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggleOption(option.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  isSelected
                    ? "border-ember-400 bg-ember-400/10 text-ember-900 dark:border-ember-500/60 dark:text-ember-200"
                    : "border-paper-200 text-ink-700 hover:border-paper-300 hover:bg-paper-50 dark:border-ink-800 dark:text-ink-200 dark:hover:bg-ink-900",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center border",
                    isCheckbox ? "rounded" : "rounded-full",
                    isSelected
                      ? "border-ember-500 bg-ember-500 text-white"
                      : "border-paper-300 dark:border-ink-600",
                  )}
                >
                  {isSelected && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="flex-1">{option.option}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: QuizAttemptResult }) {
  const passed = result.score >= 60;
  return (
    <div className="rounded-xl border border-paper-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4",
            passed
              ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-400"
              : "border-ember-500 bg-ember-500/10 text-ember-700 dark:text-ember-400",
          )}
        >
          <span className="font-display text-2xl italic">{result.score}%</span>
        </div>
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg italic text-ink-950 dark:text-paper-50">
            <Trophy size={18} className={passed ? "text-teal-600 dark:text-teal-400" : "text-ember-600 dark:text-ember-400"} />
            {passed ? "Well done!" : "Keep practicing"}
          </h2>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">
            You answered {result.correct_count} of {result.total} questions correctly.
          </p>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
            {result.attempts_left > 0
              ? `${result.attempts_left} attempt${result.attempts_left === 1 ? "" : "s"} left on this quiz.`
              : "No attempts left on this quiz."}
          </p>
        </div>
      </div>
    </div>
  );
}
