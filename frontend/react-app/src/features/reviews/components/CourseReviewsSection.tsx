import { useCallback, useEffect, useState } from "react";
import { MessageSquareQuote, Pencil } from "lucide-react";
import { useAuth } from "../../../providers/AuthProvider";
import { reviewsApi } from "../api/reviewsApi";
import { ReviewForm } from "./ReviewForm";
import { ReviewStarsDisplay } from "./ReviewStarsInput";

interface MyReviewState {
  id: string;
  rating: number;
  comment: string | null;
}

/**
 * The "review this course" section on the course page.
 *
 * - Guests: just the list of reviews.
 * - Signed-in users who haven't reviewed yet: see the write form right away
 *   ("They have to see review course if they haven't reviewed yet").
 * - Signed-in users who already reviewed: see their review with an Edit
 *   button (one review per user per course — update in place, never a second).
 *
 * The backend's course-reviews endpoint doesn't include reviewer identity,
 * so the list shows rating + comment only. The signed-in user's own review
 * comes from GET /api/reviews/my-reviews (matched by course UUID); the
 * is-reviewed endpoint only answers "have you reviewed?" with a boolean.
 */
export function CourseReviewsSection({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment: string | null }>>([]);
  const [myReview, setMyReview] = useState<MyReviewState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await reviewsApi.fetchCourseReviews(courseId);
      setReviews(list);

      if (user) {
        const { is_reviewed } = await reviewsApi.fetchIsReviewed(courseId);
        if (is_reviewed) {
          const mine = await reviewsApi.fetchMyReviews();
          const found = mine.find((r) => r.course.id === courseId);
          setMyReview(
            found
              ? { id: found.id, rating: found.rating, comment: found.comment }
              : null,
          );
        } else {
          setMyReview(null);
        }
        setIsEditing(false);
      }
    } catch {
      // Leave the section empty rather than crash the whole page.
    } finally {
      setIsLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleSaved(saved: { id: string; rating: number; comment: string | null }) {
    setReviews((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev];
    });
    setMyReview(saved);
    setIsEditing(false);
  }

  async function handleDelete() {
    if (!myReview) return;
    await reviewsApi.deleteReview(myReview.id);
    setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
    setMyReview(null);
    setIsEditing(false);
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-ink-950 dark:text-paper-50">Reviews</h2>
        {reviews.length > 0 && (
          <span className="text-xs text-ink-500 dark:text-ink-400">{reviews.length} review(s)</span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 h-40 animate-pulse rounded-xl bg-paper-100 dark:bg-ink-900" />
      ) : (
        <div className="mt-4 flex flex-col gap-6">
          {/* Your review — the write/update entry point for signed-in users */}
          {user && (
            <div className="rounded-2xl border border-paper-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
              {myReview && !isEditing ? (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-ink-950 dark:text-paper-50">Your review</p>
                    <ReviewStarsDisplay rating={myReview.rating} />
                    <p className="text-sm text-ink-600 dark:text-ink-300">{myReview.comment}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-paper-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-paper-100 dark:border-ink-700 dark:text-paper-100 dark:hover:bg-ink-800"
                  >
                    <Pencil size={13} />
                    Edit review
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-semibold text-ink-950 dark:text-paper-50">
                    {myReview ? "Edit your review" : "Review this course"}
                  </p>
                  {!myReview && (
                    <p className="text-xs text-ink-500 dark:text-ink-400">
                      Took the course? Leave a rating and help other students choose.
                    </p>
                  )}
                  <div className="mt-2">
                    <ReviewForm
                      initialRating={myReview?.rating ?? 0}
                      initialComment={myReview?.comment ?? ""}
                      submitLabel={myReview ? "Save changes" : "Submit review"}
                      onCancel={myReview ? () => setIsEditing(false) : undefined}
                      onDelete={myReview ? handleDelete : undefined}
                      onSubmit={async (rating, comment) => {
                        const saved = myReview
                          ? await reviewsApi.updateReview(myReview.id, { rating, comment })
                          : await reviewsApi.createReview({ course: courseId, rating, comment });
                        handleSaved(saved);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All reviews */}
          {reviews.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-ink-500 dark:text-ink-400">
              <MessageSquareQuote size={15} />
              No reviews yet — be the first to share your thoughts.
            </p>
          ) : (
            <ul className="flex flex-col gap-5">
              {reviews.map((review) => (
                <li key={review.id} className="flex flex-col gap-1.5">
                  <ReviewStarsDisplay rating={review.rating} size={12} />
                  {review.comment && (
                    <p className="text-sm text-ink-600 dark:text-ink-300">{review.comment}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
