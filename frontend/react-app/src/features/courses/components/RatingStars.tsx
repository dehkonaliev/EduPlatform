import { Star } from "lucide-react";
import { cn } from "../../../lib/utils";

interface RatingStarsProps {
  rating: number;
  count: number;
  size?: number;
  className?: string;
}

export function RatingStars({ rating, count, size = 13, className }: RatingStarsProps) {
  if (count === 0) {
    return <span className={cn("text-xs text-ink-500 dark:text-ink-400", className)}>No ratings yet</span>;
  }

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      <span className="font-semibold text-ember-600 dark:text-ember-400">{rating.toFixed(1)}</span>
      <div className="flex" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={size}
            className={cn(
              index < Math.round(rating)
                ? "fill-ember-400 text-ember-400"
                : "fill-transparent text-ink-300 dark:text-ink-600",
            )}
          />
        ))}
      </div>
      <span className="text-ink-500 dark:text-ink-400">({count})</span>
    </div>
  );
}