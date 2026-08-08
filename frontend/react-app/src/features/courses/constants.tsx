import { ClipboardList, FileText, Flame, HelpCircle, Layers, PlayCircle, Sprout, TrendingUp } from "lucide-react";
import type { CourseLevel, CourseStatus, LessonType, PricingType } from "./types";

/** Badge + label for each publishing-workflow state. */
export const COURSE_STATUS_META: Record<
  CourseStatus,
  { label: string; badgeClassName: string }
> = {
  DRAFT: {
    label: "Draft",
    badgeClassName: "bg-paper-200 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  },
  IN_REVIEW: {
    label: "In review",
    badgeClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  REJECTED: {
    label: "Rejected",
    badgeClassName: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
  PUBLISHED: {
    label: "Published",
    badgeClassName: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  },
  ARCHIVED: {
    label: "Archived",
    badgeClassName: "bg-ink-500/10 text-ink-600 dark:text-ink-300",
  },
};

export const LEVEL_META: Record<
  CourseLevel,
  { label: string; icon: typeof Sprout; className: string }
> = {
  BEGINNER: {
    label: "Beginner",
    icon: Sprout,
    className: "text-teal-600 dark:text-teal-400",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    icon: TrendingUp,
    className: "text-ember-600 dark:text-ember-400",
  },
  ADVANCED: {
    label: "Advanced",
    icon: Flame,
    className: "text-red-600 dark:text-red-400",
  },
  ALL_LEVELS: {
    label: "All Levels",
    icon: Layers,
    className: "text-ink-600 dark:text-ink-300",
  },
};

/** Filter dropdown options shared by the student and instructor search pages. */
export const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = (
  Object.keys(LEVEL_META) as CourseLevel[]
).map((level) => ({ value: level, label: LEVEL_META[level].label }));

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "uz", label: "Uzbek" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
];

export const PRICING_TYPE_OPTIONS: { value: PricingType; label: string }[] = [
  { value: "FREE", label: "Free" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "SPECIAL", label: "Special" },
];

export const RATING_OPTIONS: { value: string; label: string }[] = [
  { value: "3", label: "3.0+ stars" },
  { value: "4", label: "4.0+ stars" },
  { value: "4.5", label: "4.5+ stars" },
  { value: "5", label: "5.0 stars" },
];

export const LESSON_TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
};

export const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  VIDEO: "Video",
  ARTICLE: "Article",
  QUIZ: "Quiz",
  ASSIGNMENT: "Assignment",
};

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}