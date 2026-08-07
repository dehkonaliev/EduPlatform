import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { parseApiError } from "../../../lib/api/parseApiError";
import { ReviewStarsInput } from "./ReviewStarsInput";

interface ReviewFormProps {
  initialRating: number;
  initialComment: string;
  submitLabel: string;
  onCancel?: () => void;
  /** Must throw on failure so the form can surface the error. */
  onSubmit: (rating: number, comment: string) => Promise<void>;
  /** When provided, renders a destructive "Delete" action next to the submit button. */
  onDelete?: () => Promise<void>;
}

const MAX_COMMENT_LENGTH = 2000;

export function ReviewForm({
  initialRating,
  initialComment,
  submitLabel,
  onCancel,
  onSubmit,
  onDelete,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim());
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setError(null);
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink-800 dark:text-paper-100">How was it?</span>
        <ReviewStarsInput rating={rating} onChange={setRating} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-comment" className="text-sm font-medium text-ink-800 dark:text-paper-100">
          Your review
        </label>
        <textarea
          id="review-comment"
          rows={0}
          maxLength={MAX_COMMENT_LENGTH}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="What did you like about the course? Be specific and helpful."
          className="w-full resize-y rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-950 outline-none transition-colors placeholder:text-ink-500/60 focus:border-ember-400 dark:border-ink-800 dark:bg-ink-900 dark:text-paper-50"
        />
        <p className="text-right text-xs text-ink-400 dark:text-ink-500">
          {comment.length}/{MAX_COMMENT_LENGTH}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || isDeleting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink-900 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            {isDeleting && <Loader2 size={15} className="animate-spin" />}
            {isDeleting ? "Deleting..." : "Delete review"}
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-800 dark:text-ink-300 dark:hover:text-paper-100"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
