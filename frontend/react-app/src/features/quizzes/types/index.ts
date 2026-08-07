export type QuizQuestionType = "RADIO" | "CHECKBOX" | "TEXT";

export interface QuizOption {
  id: string;
  option: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  question_type: QuizQuestionType;
  options: QuizOption[];
}

/** Shape returned by GET /api/quizzes/get-quiz/<uuid:pk> */
export interface QuizDetail {
  id: string;
  title: string;
  lesson: string;
  questions: QuizQuestion[];
}

/** One entry of the `response` array sent to the attempt endpoint. */
export interface QuizResponseItem {
  question_id: string;
  selected_options: string[];
}

/** Shape returned by POST /api/quizzes/quiz-attempt/<uuid:pk> */
export interface QuizAttemptResult {
  score: number;
  correct_count: number;
  total: number;
  attempts_left: number;
}
