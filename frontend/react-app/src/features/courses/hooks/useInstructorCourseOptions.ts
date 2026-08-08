import { useEffect, useMemo, useState } from "react";
import { coursesApi } from "../api/coursesApi";
import { useInstructorCourses } from "./useInstructorCourses";

interface UseInstructorCourseOptionsResult {
  courseOptions: { value: string; label: string }[];
  isLoading: boolean;
  error: string | null;
}

/** Own-course dropdown options for the module/lesson forms. instructor-courses
 * now returns courses of every status, but a preset course (e.g. from a
 * ?course=<id> deep link) is still fetched directly to guarantee it appears
 * even while the list is loading. */
export function useInstructorCourseOptions(
  presetCourseId: string,
): UseInstructorCourseOptionsResult {
  const { courses, isLoading, error } = useInstructorCourses();
  const [presetTitle, setPresetTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!presetCourseId) return;
    let cancelled = false;
    coursesApi
      .fetchCourseDetail(presetCourseId)
      .then((course) => {
        if (!cancelled) setPresetTitle(course.title);
      })
      .catch(() => {
        /* leave it out of the list */
      });
    return () => {
      cancelled = true;
    };
  }, [presetCourseId]);

  const courseOptions = useMemo(() => {
    const options = courses.map((course) => ({ value: course.id, label: course.title }));
    const alreadyListed = options.some((option) => option.value === presetCourseId);
    if (presetCourseId && presetTitle && !alreadyListed) {
      options.unshift({ value: presetCourseId, label: presetTitle });
    }
    return options;
  }, [courses, presetCourseId, presetTitle]);

  return { courseOptions, isLoading, error };
}
