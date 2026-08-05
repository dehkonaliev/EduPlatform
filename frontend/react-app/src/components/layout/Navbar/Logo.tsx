import { Link } from "react-router-dom";

/**
 * The four-point "spark" mark is Curiosite's signature element — it recurs
 * elsewhere in the product (loading state, empty states) so it's worth
 * keeping this as the one true source of the shape.
 */
export function Logo() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-2 shrink-0"
      aria-label="Curiosite home"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        className="transition-transform duration-500 ease-out group-hover:rotate-45"
      >
        <path
          d="M14 0 L16.6 11.4 L28 14 L16.6 16.6 L14 28 L11.4 16.6 L0 14 L11.4 11.4 Z"
          className="fill-ink-800 dark:fill-ember-400"
        />
      </svg>
      <span className="font-display italic text-xl tracking-tight text-ink-950 dark:text-paper-50">
        Curiosite
      </span>
    </Link>
  );
}