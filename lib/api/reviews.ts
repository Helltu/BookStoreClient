import apiClient from './axios';
import type { Review } from '../types/reviews';

export const reviewsApi = {
  getByBook: (bookId: string) =>
    apiClient.get<Review[]>(`/reviews/book/${bookId}`),

  canReview: (bookId: string) =>
    apiClient.get<boolean>(`/reviews/can-review`, { params: { bookId }, skipErrorToast: true }),

  create: (bookId: string, rating: number, text: string) =>
    apiClient.post<string>('/reviews', { bookId, rating, text }),

  delete: (id: string) =>
    apiClient.delete<void>(`/reviews/${id}`),
};
