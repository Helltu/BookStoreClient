export interface Genre {
  id: string;
  name: string;
  deletedAt?: string | null;
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  photoUrl?: string;
  deletedAt?: string | null;
}

export interface Publisher {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  deletedAt?: string | null;
}

export type BookFormat = "HARDCOVER" | "PAPERBACK" | "POCKET" | "LARGE_FORMAT" | "COLLECTOR";

export interface ManagedBook {
  id: string;
  title: string;
  description: string;
  price: number;
  isbn?: string;
  stockQuantity?: number;
  deletedAt?: string | null;
  language?: string;
  originalLanguage?: string;
  publicationYear?: number;
  pagesCount?: number;
  format?: BookFormat;
  weight?: number;
  dimensions?: string;
  ageRating?: string;
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
  stockQuantity: number;
  pagesCount: number | null;
  format: BookFormat | null;
  weight: number | null;
  dimensions: string;
  ageRating: string;
  publicationYear: number | null;
  language: string;
  originalLanguage: string;
  authorIds: string[];
  genreIds: string[];
  publisherId: string | null;
  keywords: string[];
  coverFile: File | null;
  previewFiles: File[];
  keepPreviewUrls?: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  number: number;
  totalElements: number;
}
