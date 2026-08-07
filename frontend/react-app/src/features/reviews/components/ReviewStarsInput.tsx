import { Star } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ReviewStarsInputProps {
  rating: number;
  onChange: (rating: number) => void;
  size?: number;
  className?: string;
}

export function ReviewStarsInput({
  rating,
  onChange,
  size = 22,
  className,
}: ReviewStarsInputProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} role="radiogroup" aria-label="Your rating">
      {Array.from({ length: 5 }).map((_, index) => {
        const value = index + 1;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
            onClick={() => onChange(value)}
            className={cn(
              "rounded-full p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400",
              value <= rating ? "text-ember-400" : "text-ink-300 dark:text-ink-600",
            )}
          >
            <Star size={size} className={cn(value <= rating && "fill-ember-400")} />
          </button>
        );
      })}
    </div>
  );
}

/** Read-only star row for displaying an existing rating. */
export function ReviewStarsDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={size}
          className={
            index < Math.round(rating)
              ? "fill-ember-400 text-ember-400"
              : "fill-transparent text-ink-300 dark:text-ink-600"
          }
        />
      ))}
    </div>
  );
}
