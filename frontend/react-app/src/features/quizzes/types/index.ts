export type QuizQuestionType = "RADIO" | "CHECKBOX" | "TEXT";

export interface QuizOption {
  id: string;
  option: string;
  /** Only present for options the instructor created during this session —
   * GET /quizzes/get-quiz intentionally hides correct answers. */
  is_correct?: boolean;
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

// --- Instructor / quiz-building payloads ---

/** Payload for POST /api/quizzes/create-quiz. */
export interface CreateQuizPayload {
  title: string;
  lesson: string;
}

/** Data returned by POST /api/quizzes/create-quiz. */
export interface CreateQuizResponse {
  id: string;
  title: string;
  lesson: string;
}

/** Payload for POST /api/quizzes/create-question. */
export interface CreateQuestionPayload {
  quiz: string;
  question: string;
  question_type: QuizQuestionType;
}

/** Data returned by POST /api/quizzes/create-question. */
export interface CreateQuestionResponse {
  id: string;
  quiz: string;
  question: string;
  question_type: QuizQuestionType;
}

/** Payload for POST /api/quizzes/create-option. */
export interface CreateOptionPayload {
  question: string;
  option: string;
  is_correct: boolean;
}

/** Data returned by POST /api/quizzes/create-option. */
export interface CreateOptionResponse {
  id: string;
  question: string;
  option: string;
  is_correct: boolean;
}
