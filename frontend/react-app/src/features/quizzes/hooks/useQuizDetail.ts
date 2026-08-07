import { useEffect, useState } from "react";
import { quizzesApi } from "../api/quizzesApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { QuizDetail } from "../types";

interface UseQuizDetailResult {
  quiz: QuizDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function useQuizDetail(quizId: string | null | undefined): UseQuizDetailResult {
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quizId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await quizzesApi.fetchQuiz(quizId!);
        if (!cancelled) setQuiz(data);
      } catch (err) {
        if (!cancelled) setError(parseApiError(err).generalMessage);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  return { quiz, isLoading, error };
}
