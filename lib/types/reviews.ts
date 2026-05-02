export interface ReviewAuthor {
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  author: ReviewAuthor;
}

export type ReviewSortKey = 'newest' | 'oldest' | 'highest' | 'lowest';
