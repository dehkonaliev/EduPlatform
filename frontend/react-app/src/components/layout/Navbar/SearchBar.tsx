import { useEffect, useRef, useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";

interface SearchBarProps {
  className?: string;
  /** Instructor mode searches the instructor's OWN courses and submits to
   * /instructor/courses?search=… instead of the public /courses search. */
  instructorMode?: boolean;
}

export function SearchBar({ className, instructorMode = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Power-user shortcut: press "/" or Cmd/Ctrl+K anywhere to jump into search
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isTypingElsewhere =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key === "k";
      if (isShortcut || (event.key === "/" && !isTypingElsewhere)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(
      `${instructorMode ? "/instructor/courses" : "/courses"}?search=${encodeURIComponent(trimmed)}`,
    );
    inputRef.current?.blur();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-xl", className)}
      role="search"
    >
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-300"
        size={17}
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={
          instructorMode ? "Search your courses…" : "Search for courses, instructors, topics..."
        }
        className={cn(
          "w-full rounded-full border bg-paper-100 py-2.5 pl-10 pr-16 text-sm text-ink-950 placeholder:text-ink-500/70 outline-none transition-all duration-200",
          "dark:bg-ink-900 dark:text-paper-50 dark:placeholder:text-ink-300/60",
          focused
            ? "border-ember-400 bg-white shadow-[var(--shadow-glow-ember)] dark:bg-ink-800"
            : "border-transparent",
        )}
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink-500 hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-50"
        >
          <X size={15} />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-ink-100 px-1.5 py-0.5 text-[10px] font-medium text-ink-500 dark:border-ink-700 dark:text-ink-300 sm:block">
          ⌘K
        </kbd>
      )}
    </form>
  );
}