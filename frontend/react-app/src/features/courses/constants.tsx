import { Flame, Layers, Sprout, TrendingUp } from "lucide-react";
import type { CourseLevel } from "./types";

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