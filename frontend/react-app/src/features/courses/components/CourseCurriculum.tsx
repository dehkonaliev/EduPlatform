import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  HelpCircle,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import type { CourseModule, LessonType } from "../types";

const LESSON_TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  ARTICLE: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
}

interface CourseCurriculumProps {
  modules: CourseModule[];
}

export function CourseCurriculum({ modules }: CourseCurriculumProps) {
  const [openModuleId, setOpenModuleId] = useState<string | null>(modules[0]?.id ?? null);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalMinutes = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((lSum, l) => lSum + l.duration_minutes, 0),
    0,
  );

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-ink-950 dark:text-paper-50">Curriculum</h2>
        <span className="text-xs text-ink-500 dark:text-ink-400">
          {modules.length} {modules.length === 1 ? "module" : "modules"} · {totalLessons}{" "}
          {totalLessons === 1 ? "lesson" : "lessons"} · {formatDuration(totalMinutes)}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-paper-200 dark:border-ink-800">
        {modules.map((module, index) => {
          const isOpen = openModuleId === module.id;
          return (
            <div
              key={module.id}
              className={index > 0 ? "border-t border-paper-200 dark:border-ink-800" : undefined}
            >
              <button
                type="button"
                onClick={() => setOpenModuleId(isOpen ? null : module.id)}
                className="flex w-full items-center justify-between gap-3 bg-paper-100/60 px-4 py-3 text-left transition-colors hover:bg-paper-100 dark:bg-ink-900/60 dark:hover:bg-ink-900"
              >
                <span className="text-sm font-semibold text-ink-950 dark:text-paper-50">
                  {module.title}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  {module.lessons.length} lessons
                  <ChevronDown
                    size={15}
                    className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </span>
              </button>

              {isOpen && (
                <ul>
                  {module.lessons.map((lesson) => {
                    const Icon = LESSON_TYPE_ICON[lesson.lesson_type] ?? FileText;
                    return (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 border-t border-paper-200 px-4 py-3 dark:border-ink-800"
                      >
                        <Icon size={16} className="shrink-0 text-ink-400 dark:text-ink-500" />
                        <span className="flex-1 text-sm text-ink-800 dark:text-paper-100">
                          {lesson.title}
                        </span>
                        {lesson.is_preview && (
                          <span className="flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:text-teal-400">
                            <Sparkles size={10} /> Preview
                          </span>
                        )}
                        <span className="shrink-0 text-xs text-ink-500 dark:text-ink-400">
                          {formatDuration(lesson.duration_minutes)}
                        </span>
                        {!lesson.is_preview && (
                          <Lock size={13} className="shrink-0 text-ink-300 dark:text-ink-600" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}