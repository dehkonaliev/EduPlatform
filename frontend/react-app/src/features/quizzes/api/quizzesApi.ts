import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type { QuizAttemptResult, QuizDetail, QuizResponseItem } from "../types";

export const quizzesApi = {
  /** GET /api/quizzes/get-quiz/<uuid:pk> — quiz with questions + options.
   * Correct answers are never exposed here. */
  fetchQuiz: async (quizId: string): Promise<QuizDetail> => {
    const { data } = await apiClient.get<ApiEnvelope<QuizDetail>>(
      `/quizzes/get-quiz/${quizId}`,
    );
    return data.data;
  },

  /** POST /api/quizzes/quiz-attempt/<uuid:pk> — submits answers and returns
   * the score. A student gets at most three tries per quiz. */
  submitAttempt: async (
    quizId: string,
    response: QuizResponseItem[],
  ): Promise<QuizAttemptResult> => {
    const { data } = await apiClient.post<ApiEnvelope<QuizAttemptResult>>(
      `/quizzes/quiz-attempt/${quizId}`,
      { response },
    );
    return data.data;
  },
};
