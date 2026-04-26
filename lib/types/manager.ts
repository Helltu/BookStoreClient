export interface Genre {
  id: string;
  name: string;
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  photoUrl?: string;
}

export interface Publisher {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface ManagedBook {
  id: string;
  title: string;
  description: string;
  price: number;
  isbn?: string;
  stock?: number;
  language?: string;
  publicationYear?: number;
  pageCount?: number;
  coverUrl?: string;
  previewUrls?: string[];
  authors: string[];
  genres?: string[];
  publisher?: string;
  averageRating?: number;
  totalReviews?: number;
  keywords?: string[];
}

export interface BookFormData {
  title: string;
  description: string;
  isbn: string;
  price: number;
  stock: number;
  authorIds: string[];
  genreIds: string[];
  publisherId: string | null;
  keywords: string[];
  coverFile: File | null;
  previewFiles: File[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
  totalElements: number;
}
