import { useEffect, useState } from "react";
import { coursesApi } from "../api/coursesApi";
import { parseApiError } from "../../../lib/api/parseApiError";
import type { CategorySummary, InstructorSummary, TagSummary } from "../types";

interface UseSearchOptionsResult {
  categories: CategorySummary[];
  tags: TagSummary[];
  instructors: InstructorSummary[];
  isLoading: boolean;
  error: string | null;
}

/** Loads the option lists (categories, tags, instructors) the search page
 * filters reference. */
export function useSearchOptions(): UseSearchOptionsResult {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [instructors, setInstructors] = useState<InstructorSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [categoriesData, tagsData, instructorsData] = await Promise.all([
          coursesApi.fetchCategories(),
          coursesApi.fetchTags(),
          coursesApi.fetchInstructors(),
        ]);
        if (!cancelled) {
          setCategories(categoriesData);
          setTags(tagsData);
          setInstructors(instructorsData);
        }
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
  }, []);

  return { categories, tags, instructors, isLoading, error };
}
