import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { InstructorCourseCard } from "../../features/courses/components/InstructorCourseCard";
import { CourseCardSkeleton } from "../../features/courses/components/CourseCardSkeleton";
import { useInstructorCourses } from "../../features/courses/hooks/useInstructorCourses";
import { useSearchOptions } from "../../features/courses/hooks/useSearchOptions";
import {
  COURSE_STATUS_META,
  LANGUAGE_OPTIONS,
  LEVEL_OPTIONS,
  PRICING_TYPE_OPTIONS,
  RATING_OPTIONS,
} from "../../features/courses/constants";
import type { CourseStatus } from "../../features/courses/types";

const SKELETON_COUNT = 8;

interface CourseCatalogProps {
  /** When set, only courses in this status are shown (client-side filter on
   * the instructor's full catalog). */
  statusFilter?: CourseStatus;
}

/** Search + filter + card grid for the instructor's own courses. Rendered
 * inside the InstructorCoursesLayout tabs. */
export function CourseCatalog({ statusFilter }: CourseCatalogProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("search") ?? "");

  const { courses, count, filters, setFilter, clearFilters, isLoading, error } =
    useInstructorCourses({ search: searchParams.get("search") ?? undefined });
  const { categories, tags, isLoading: isLoadingOptions, error: optionsError } =
    useSearchOptions();

  // Keep the input + search filter in sync with the URL — the navbar search
  // submits to /instructor/courses?search=…, so a mounted tab follows it.
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    setQuery(urlSearch);
    setFilter("search", urlSearch);
  }, [searchParams, setFilter]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (trimmed) next.set("search", trimmed);
      else next.delete("search");
      return next;
    });
    setFilter("search", trimmed);
  }

  const visibleCourses = statusFilter
    ? courses.filter((course) => course.status === statusFilter)
    : courses;
  const visibleCount = statusFilter
    ? visibleCourses.length
    : count;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const mergedError = error ?? optionsError;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-300"
            />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your courses by title or subtitle…"
              className="w-full rounded-full border border-paper-200 bg-white py-3 pl-11 pr-10 text-sm text-ink-950 placeholder:text-ink-500/70 outline-none transition-all focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50 dark:placeholder:text-ink-300/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-ember-400 px-6 py-3 text-sm font-semibold text-ink-950 transition-colors hover:bg-ember-300"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-950 dark:text-paper-50">
            <SlidersHorizontal size={15} className="text-ember-500 dark:text-ember-400" />
            Filters
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full text-xs font-medium text-ember-600 hover:text-ember-500 dark:text-ember-400"
            >
              <RotateCcw size={12} /> Clear all ({activeFilterCount})
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Category"
            value={filters.category ?? ""}
            onChange={(value) => setFilter("category", value)}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
            disabled={isLoadingOptions}
          />
          <FilterSelect
            label="Tag"
            value={filters.tag ?? ""}
            onChange={(value) => setFilter("tag", value)}
            options={tags.map((tag) => ({ value: tag.name, label: tag.name }))}
            disabled={isLoadingOptions}
          />
          <FilterSelect
            label="Level"
            value={filters.level ?? ""}
            onChange={(value) => setFilter("level", value)}
            options={LEVEL_OPTIONS}
          />
          <FilterSelect
            label="Language"
            value={filters.language ?? ""}
            onChange={(value) => setFilter("language", value)}
            options={LANGUAGE_OPTIONS}
          />
          <FilterSelect
            label="Pricing"
            value={filters.pricing_type ?? ""}
            onChange={(value) => setFilter("pricing_type", value)}
            options={PRICING_TYPE_OPTIONS}
          />
          <FilterSelect
            label="Rating"
            value={filters.rating ?? ""}
            onChange={(value) => setFilter("rating", value)}
            options={RATING_OPTIONS}
          />
        </div>
      </div>

      {mergedError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {mergedError}
        </div>
      )}

      <p className="mt-8 text-sm text-ink-600 dark:text-ink-300">
        {isLoading
          ? "Loading…"
          : visibleCount === 0
            ? "No courses found"
            : `${visibleCount} course${visibleCount === 1 ? "" : "s"} found`}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))
          : visibleCourses.map((course) => (
              <InstructorCourseCard key={course.id} course={course} />
            ))}
      </div>

      {!isLoading && !mergedError && visibleCourses.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-paper-300 bg-white/50 px-6 py-16 text-center dark:border-ink-800 dark:bg-ink-900/40">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-200 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
            <Search size={22} />
          </span>
          <p className="text-sm font-medium text-ink-800 dark:text-paper-100">
            No {statusFilter ? COURSE_STATUS_META[statusFilter].label.toLowerCase() : "courses"} here
          </p>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            {statusFilter
              ? "Courses move to this tab once their status changes."
              : "Try a different search, clear some filters, or create your first course."}
          </p>
        </div>
      )}
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-ink-500 dark:text-ink-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-paper-200 bg-white px-3 py-2 text-sm text-ink-950 outline-none transition-colors focus:border-ember-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
