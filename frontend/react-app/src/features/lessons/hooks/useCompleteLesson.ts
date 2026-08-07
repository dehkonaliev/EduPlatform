import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lessonsApi } from "../api/lessonsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { CompleteLessonResult, LessonDetail } from "../types";

interface UseCompleteLessonResult {
  /** POSTs the lesson-progress endpoint; navigates to the next lesson on
   * success (unless the course is complete). */
  complete: () => Promise<void>;
  isCompleting: boolean;
  error: string | null;
  result: CompleteLessonResult | null;
}

export function useCompleteLesson(lesson: LessonDetail): UseCompleteLessonResult {
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompleteLessonResult | null>(null);

  const complete = useCallback(async () => {
    if (!lesson.progress_id || isCompleting) return;
    setIsCompleting(true);
    setError(null);
    try {
      const res = await lessonsApi.completeLesson(lesson.progress_id);
      setResult(res);
      if (res.next) {
        navigate(`/learn/${res.next.lesson}`);
      }
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsCompleting(false);
    }
  }, [lesson.progress_id, isCompleting, navigate]);

  return { complete, isCompleting, error, result };
}
