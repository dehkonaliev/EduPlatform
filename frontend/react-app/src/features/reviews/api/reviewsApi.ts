import { apiClient } from "../../../lib/api/client";
import type { ApiEnvelope } from "../../../lib/api/types";
import type {
  IsReviewedResponse,
  MyReview,
  Review,
  ReviewCreatePayload,
  ReviewUpdatePayload,
} from "../types";

export const reviewsApi = {
  /** GET /api/reviews/course/<uuid:pk> — public, anyone can read the list. */
  fetchCourseReviews: async (courseId: string): Promise<Review[]> => {
    const { data } = await apiClient.get<ApiEnvelope<Review[]>>(
      `/reviews/course/${courseId}`,
    );
    return data.data;
  },

  /**
   * GET /api/reviews/is-reviewed/<uuid:pk> — requires auth. Tells us whether
   * the current user already reviewed this course (a plain boolean). If true,
   * grab the review itself via fetchMyReviews.
   */
  fetchIsReviewed: async (courseId: string): Promise<IsReviewedResponse> => {
    const { data } = await apiClient.get<ApiEnvelope<IsReviewedResponse>>(
      `/reviews/is-reviewed/${courseId}`,
    );
    return data.data;
  },

  /** GET /api/reviews/my-reviews — the current user's reviews (with course info). */
  fetchMyReviews: async (): Promise<MyReview[]> => {
    const { data } = await apiClient.get<ApiEnvelope<MyReview[]>>("/reviews/my-reviews");
    return data.data;
  },

  /** POST /api/reviews/review-create — one review per user per course (backend enforces). */
  createReview: async (payload: ReviewCreatePayload): Promise<Review> => {
    const { data } = await apiClient.post<ApiEnvelope<Review>>(
      "/reviews/review-create",
      payload,
    );
    return data.data;
  },

  /** PATCH /api/reviews/review-update-delete/<uuid:pk> — owner can update their rating/comment. */
  updateReview: async (reviewId: string, payload: ReviewUpdatePayload): Promise<Review> => {
    const { data } = await apiClient.patch<ApiEnvelope<Review>>(
      `/reviews/review-update-delete/${reviewId}`,
      payload,
    );
    return data.data;
  },

  /** DELETE /api/reviews/review-update-delete/<uuid:pk> — owner can remove their review. */
  deleteReview: async (reviewId: string): Promise<void> => {
    await apiClient.delete<ApiEnvelope<unknown>>(`/reviews/review-update-delete/${reviewId}`);
  },
};
