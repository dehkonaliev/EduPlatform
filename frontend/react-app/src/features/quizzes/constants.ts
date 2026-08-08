import type { QuizQuestionType } from "./types";

export const QUESTION_TYPE_META: Record<
  QuizQuestionType,
  { label: string; description: string; badgeClassName: string }
> = {
  RADIO: {
    label: "Single choice",
    description: "Students pick one answer.",
    badgeClassName: "bg-ember-400/15 text-ember-700 dark:text-ember-300",
  },
  CHECKBOX: {
    label: "Multiple choice",
    description: "Students can pick several answers.",
    badgeClassName: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  TEXT: {
    label: "Short answer",
    description: "Students type the exact answer.",
    badgeClassName: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  },
};

export const QUESTION_TYPE_OPTIONS: { value: QuizQuestionType; label: string }[] = [
  { value: "RADIO", label: "Single choice" },
  { value: "CHECKBOX", label: "Multiple choice" },
  { value: "TEXT", label: "Short answer" },
];
