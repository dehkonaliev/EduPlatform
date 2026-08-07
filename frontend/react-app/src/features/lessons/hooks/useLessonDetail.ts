import { useEffect, useState } from "react";
import { lessonsApi } from "../api/lessonsApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { LessonDetail } from "../types";

interface UseLessonDetailResult {
  lesson: LessonDetail | null;
  isLoading: boolean;
  error: string | null;
}

export function useLessonDetail(lessonId: string | undefined): UseLessonDetailResult {
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await lessonsApi.fetchLessonDetail(lessonId!);
        if (!cancelled) setLesson(data);
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
  }, [lessonId]);

  return { lesson, isLoading, error };
}
