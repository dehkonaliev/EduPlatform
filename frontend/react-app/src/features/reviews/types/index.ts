/**
 * One review as returned by the course-reviews endpoint
 * GET /api/reviews/course/<uuid:pk> — note: NO reviewer identity is
 * included, just the course UUID, rating, and comment.
 */
export interface Review {
  id: string;
  course: string; // course UUID
  rating: number;
  comment: string | null;
}

/**
 * Unwrapped `data` of GET /api/reviews/is-reviewed/<uuid:pk>.
 * Only tells us whether the current user reviewed — the review itself must
 * be fetched from GET /api/reviews/my-reviews.
 */
export interface IsReviewedResponse {
  is_reviewed: boolean;
}

/** POST /api/reviews/review-create body — `course` is the course UUID. */
export interface ReviewCreatePayload {
  course: string;
  rating: number;
  comment: string;
}

/** PATCH /api/reviews/review-update-delete/<uuid:pk> body. */
export interface ReviewUpdatePayload {
  rating: number;
  comment: string;
}

/** Shape of GET /api/reviews/my-reviews items. */
export interface MyReviewCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
}

export interface MyReview {
  id: string;
  course: MyReviewCourse;
  rating: number;
  comment: string | null;
}
