import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "../../../lib/utils";
import { LESSON_TYPE_ICON, formatDuration } from "../../courses/constants";
import type { LessonCurriculum, LessonCurriculumModule } from "../types";

interface LessonSidebarProps {
  curriculum: LessonCurriculum;
  activeLessonId: string;
}

export function LessonSidebar({ curriculum, activeLessonId }: LessonSidebarProps) {
  const activeModuleId = curriculum.modules.find((module) =>
    module.lessons.some((lesson) => lesson.id === activeLessonId),
  )?.id;

  const [openModuleId, setOpenModuleId] = useState<string | null>(activeModuleId ?? null);

  // When navigating between lessons, keep the module containing the current
  // lesson expanded so you never lose your place.
  useEffect(() => {
    if (activeModuleId) setOpenModuleId(activeModuleId);
  }, [activeModuleId]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-ink-950">
      <div className="border-b border-paper-200 px-4 py-4 dark:border-ink-800">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ember-600 dark:text-ember-400">
          Course content
        </p>
        <Link
          to={`/courses/${curriculum.id}`}
          className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-ink-950 transition-colors hover:text-ember-600 dark:text-paper-50 dark:hover:text-ember-400"
        >
          {curriculum.title}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {curriculum.modules.map((module) => (
          <ModuleSection
            key={module.id}
            module={module}
            isOpen={openModuleId === module.id}
            onToggle={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}
            activeLessonId={activeLessonId}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleSection({
  module,
  isOpen,
  onToggle,
  activeLessonId,
}: {
  module: LessonCurriculumModule;
  isOpen: boolean;
  onToggle: () => void;
  activeLessonId: string;
}) {
  return (
    <div className="border-b border-paper-200 dark:border-ink-800">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-paper-100 dark:hover:bg-ink-900"
      >
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-ink-400 transition-transform duration-200 dark:text-ink-500",
            isOpen && "rotate-180",
          )}
        />
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-ink-800 dark:text-paper-100">
          {module.title}
        </span>
        <span className="shrink-0 text-[11px] text-ink-400 dark:text-ink-500">
          {module.lessons.length} {module.lessons.length === 1 ? "lesson" : "lessons"}
        </span>
      </button>

      {isOpen && (
        <ul className="pb-2">
          {module.lessons.map((lesson) => {
            const Icon = LESSON_TYPE_ICON[lesson.lesson_type] ?? FileText;
            const isActive = lesson.id === activeLessonId;
            return (
              <li key={lesson.id}>
                <Link
                  to={`/learn/${lesson.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 pl-8 text-sm leading-snug transition-colors",
                    isActive
                      ? "bg-ember-400/10 font-medium text-ember-700 dark:text-ember-400"
                      : "text-ink-700 hover:bg-paper-100 dark:text-ink-200 dark:hover:bg-ink-900",
                  )}
                >
                  <Icon size={15} className="shrink-0 opacity-70" />
                  <span className="flex-1">{lesson.title}</span>
                  <span className="shrink-0 text-[11px] text-ink-400 dark:text-ink-500">
                    {formatDuration(lesson.duration_minutes)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
