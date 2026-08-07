import { ClipboardList, FileText, Flame, HelpCircle, Layers, PlayCircle, Sprout, TrendingUp } from "lucide-react";
import type { CourseLevel, LessonType } from "./types";

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