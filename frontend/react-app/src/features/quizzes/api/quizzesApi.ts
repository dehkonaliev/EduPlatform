import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type {
  CreateOptionPayload,
  CreateOptionResponse,
  CreateQuestionPayload,
  CreateQuestionResponse,
  CreateQuizPayload,
  CreateQuizResponse,
  QuizAttemptResult,
  QuizDetail,
  QuizResponseItem,
} from "../types";

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

  /** POST /api/quizzes/create-quiz — creates a quiz for one of the
   * instructor's QUIZ/ASSIGNMENT lessons (one quiz per lesson). */
  createQuiz: async (payload: CreateQuizPayload): Promise<CreateQuizResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<CreateQuizResponse>>(
      "/quizzes/create-quiz",
      payload,
    );
    return data.data;
  },

  /** PATCH /api/quizzes/update-delete-quiz/<uuid:pk> — rename the quiz. */
  updateQuizTitle: async (quizId: string, title: string): Promise<CreateQuizResponse> => {
    const { data } = await apiClient.patch<ApiEnvelope<CreateQuizResponse>>(
      `/quizzes/update-delete-quiz/${quizId}`,
      { title },
    );
    return data.data;
  },

  /** DELETE /api/quizzes/update-delete-quiz/<uuid:pk> — removes the quiz and
   * all its questions and options. */
  deleteQuiz: async (quizId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/update-delete-quiz/${quizId}`);
  },

  /** POST /api/quizzes/create-question — adds a question to a quiz. */
  createQuestion: async (payload: CreateQuestionPayload): Promise<CreateQuestionResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<CreateQuestionResponse>>(
      "/quizzes/create-question",
      payload,
    );
    return data.data;
  },

  /** DELETE /api/quizzes/delete-question/<uuid:pk>. */
  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/delete-question/${questionId}`);
  },

  /** POST /api/quizzes/create-option — adds an answer option to a question.
   * `is_correct` is required: mark the right answer(s). */
  createOption: async (payload: CreateOptionPayload): Promise<CreateOptionResponse> => {
    const { data } = await apiClient.post<ApiEnvelope<CreateOptionResponse>>(
      "/quizzes/create-option",
      payload,
    );
    return data.data;
  },

  /** DELETE /api/quizzes/delete-option/<uuid:pk>. */
  deleteOption: async (optionId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/delete-option/${optionId}`);
  },
};
