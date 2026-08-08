import { useCallback, useEffect, useRef, useState } from "react";
import { coursesApi } from "../api/coursesApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { CourseSearchParams, CourseSummary } from "../types";

interface UseCourseSearchResult {
  filters: CourseSearchParams;
  setFilter: (key: keyof CourseSearchParams, value: string) => void;
  clearFilters: () => void;
  results: CourseSummary[];
  count: number;
  nextPage: number | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => void;
}

export function useCourseSearch(initialParams: CourseSearchParams = {}): UseCourseSearchResult {
  const [filters, setFilters] = useState<CourseSearchParams>(initialParams);
  const [results, setResults] = useState<CourseSummary[]>([]);
  const [count, setCount] = useState(0);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await coursesApi.searchCourses(filters, page);
        pageRef.current = page;
        setCount(data.count);
        setNextPage(data.next ? page + 1 : null);
        setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      } catch (err) {
        setError(parseApiError(err).generalMessage);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const setFilter = useCallback((key: keyof CourseSearchParams, value: string) => {
    setFilters((prev) => {
      const next = { ...prev } as Record<string, string | undefined>;
      if ((next[key] ?? "") === value) return prev;
      if (value === "") delete next[key];
      else next[key] = value;
      return next as CourseSearchParams;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const loadMore = useCallback(() => {
    if (nextPage !== null && !isLoadingMore) fetchPage(nextPage, true);
  }, [nextPage, isLoadingMore, fetchPage]);

  return {
    filters,
    setFilter,
    clearFilters,
    results,
    count,
    nextPage,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
  };
}
