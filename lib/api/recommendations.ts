import apiClient from './axios';

export interface RecommendedBook {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  price: number;
  averageRating: number | null;
  totalReviews: number | null;
  coverUrl: string | null;
}

export async function fetchSimilarBooks(bookId: string, limit = 8): Promise<RecommendedBook[]> {
  try {
    const { data } = await apiClient.get<RecommendedBook[]>(`/recommendations/similar/${bookId}`, {
      params: { limit },
      skipErrorToast: true,
    });
    return data;
  } catch {
    return [];
  }
}

export async function fetchFrequentlyBoughtWith(bookId: string, limit = 8): Promise<RecommendedBook[]> {
  try {
    const { data } = await apiClient.get<RecommendedBook[]>(`/recommendations/frequently-bought-with/${bookId}`, {
      params: { limit },
      skipErrorToast: true,
    });
    return data;
  } catch {
    return [];
  }
}

export async function fetchPersonalRecommendations(limit = 8): Promise<RecommendedBook[]> {
  try {
    const { data } = await apiClient.get<RecommendedBook[]>('/recommendations/personal', {
      params: { limit },
      skipErrorToast: true,
    });
    return data;
  } catch {
    return [];
  }
}
