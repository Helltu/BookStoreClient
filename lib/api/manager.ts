import apiClient from './axios';
import type { Genre, Author, Publisher, ManagedBook, BookFormData, PageResponse } from '../types/manager';

function multipartConfig() {
  return { headers: { 'Content-Type': 'multipart/form-data' } };
}

// Genres (JSON)
export const genresApi = {
  getAll: () => apiClient.get<Genre[]>('/catalog/genres'),
  create: (data: { name: string }) => apiClient.post<Genre>('/catalog/genres', data),
  update: (id: string, data: { name: string }) => apiClient.put<Genre>(`/catalog/genres/${id}`, data),
  delete: (id: string) => apiClient.delete(`/catalog/genres/${id}`),
};

// Authors (multipart/form-data)
export const authorsApi = {
  getAll: () => apiClient.get<Author[]>('/catalog/authors'),
  create: (data: { name: string; biography?: string; photo?: File | null }) => {
    const fd = new FormData();
    fd.append('name', data.name);
    if (data.biography) fd.append('biography', data.biography);
    if (data.photo) fd.append('photo', data.photo);
    return apiClient.post<Author>('/catalog/authors', fd, multipartConfig());
  },
  update: (id: string, data: { name: string; biography?: string; photo?: File | null }) => {
    const fd = new FormData();
    fd.append('name', data.name);
    if (data.biography) fd.append('biography', data.biography);
    if (data.photo) fd.append('photo', data.photo);
    return apiClient.put<Author>(`/catalog/authors/${id}`, fd, multipartConfig());
  },
  delete: (id: string) => apiClient.delete(`/catalog/authors/${id}`),
};

// Publishers (multipart/form-data)
export const publishersApi = {
  getAll: () => apiClient.get<Publisher[]>('/catalog/publishers'),
  create: (data: { name: string; description?: string; logo?: File | null }) => {
    const fd = new FormData();
    fd.append('name', data.name);
    if (data.description) fd.append('description', data.description);
    if (data.logo) fd.append('logo', data.logo);
    return apiClient.post<Publisher>('/catalog/publishers', fd, multipartConfig());
  },
  update: (id: string, data: { name: string; description?: string; logo?: File | null }) => {
    const fd = new FormData();
    fd.append('name', data.name);
    if (data.description) fd.append('description', data.description);
    if (data.logo) fd.append('logo', data.logo);
    return apiClient.put<Publisher>(`/catalog/publishers/${id}`, fd, multipartConfig());
  },
  delete: (id: string) => apiClient.delete(`/catalog/publishers/${id}`),
};

// Books (multipart/form-data for create/update)
export const booksApi = {
  getAll: (page: number, size: number, query?: string, inStock?: boolean, sort?: string, genres?: string[], authors?: string[], publisher?: string, minPrice?: string, maxPrice?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (query) params.set('query', query);
    if (inStock) params.set('inStock', 'true');
    if (sort) params.append('sort', sort);
    genres?.forEach(g => params.append('genres', g));
    authors?.forEach(a => params.append('authors', a));
    if (publisher) params.set('publisher', publisher);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    return apiClient.get<PageResponse<ManagedBook>>(`/catalog/search?${params}`);
  },
  getById: (id: string) => apiClient.get<ManagedBook>(`/catalog/books/${id}`),
  create: (data: BookFormData) => {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('isbn', data.isbn);
    fd.append('price', String(data.price));
    fd.append('stock', String(data.stockQuantity));
    if (data.pagesCount !== null) fd.append('pagesCount', String(data.pagesCount));
    if (data.format) fd.append('format', data.format);
    if (data.weight !== null) fd.append('weight', String(data.weight));
    if (data.dimensions) fd.append('dimensions', data.dimensions);
    if (data.ageRating) fd.append('ageRating', data.ageRating);
    if (data.publicationYear !== null) fd.append('publicationYear', String(data.publicationYear));
    if (data.language) fd.append('language', data.language);
    if (data.originalLanguage) fd.append('originalLanguage', data.originalLanguage);
    data.authorIds.forEach((id) => fd.append('authorIds', id));
    data.genreIds.forEach((id) => fd.append('genreIds', id));
    if (data.publisherId) fd.append('publisherId', data.publisherId);
    data.keywords.forEach((kw) => fd.append('keywords', kw));
    if (data.coverFile) fd.append('coverFile', data.coverFile);
    data.previewFiles.forEach((file) => fd.append('previewFiles', file));
    return apiClient.post<string>('/catalog/books', fd, multipartConfig());
  },
  update: (id: string, data: BookFormData) => {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('price', String(data.price));
    fd.append('stock', String(data.stockQuantity));
    if (data.pagesCount !== null) fd.append('pagesCount', String(data.pagesCount));
    if (data.format) fd.append('format', data.format);
    if (data.weight !== null) fd.append('weight', String(data.weight));
    if (data.dimensions) fd.append('dimensions', data.dimensions);
    if (data.ageRating) fd.append('ageRating', data.ageRating);
    if (data.publicationYear !== null) fd.append('publicationYear', String(data.publicationYear));
    if (data.language) fd.append('language', data.language);
    if (data.originalLanguage) fd.append('originalLanguage', data.originalLanguage);
    data.authorIds.forEach((aid) => fd.append('authorIds', aid));
    data.genreIds.forEach((gid) => fd.append('genreIds', gid));
    if (data.publisherId) fd.append('publisherId', data.publisherId);
    data.keywords.forEach((kw) => fd.append('keywords', kw));
    if (data.coverFile) fd.append('coverFile', data.coverFile);
    data.previewFiles.forEach((file) => fd.append('previewFiles', file));
    if (data.keepPreviewUrls !== undefined) {
      data.keepPreviewUrls.forEach((url) => fd.append('keepPreviewUrls', url));
    }
    return apiClient.put<void>(`/catalog/books/${id}`, fd, multipartConfig());
  },
  importByIsbn: (isbn: string, price: number, stock: number) =>
    apiClient.post<string>('/catalog/import', { isbn, price, stock }),
  adjustStock: (id: string, stockQuantity: number) =>
    apiClient.patch<void>(`/catalog/books/${id}/stock`, { quantity: stockQuantity }),
  delete: (id: string) => apiClient.delete(`/catalog/books/${id}`),
  generateKeywords: (id: string) => apiClient.get<string[]>(`/catalog/books/${id}/keywords/generate`),
  generateDescription: (id: string) => apiClient.get<string>(`/catalog/books/${id}/description/generate`),
  suggestKeywords: (body: { title: string; description?: string | null; existingKeywords: string[] }) =>
    apiClient.post<string[]>('/catalog/books/keywords/suggest', body),
  suggestDescription: (body: { title: string; authors: string; genres: string }) =>
    apiClient.post<string>('/catalog/books/description/suggest', body),
};

export type CatalogEntity = 'genres' | 'authors' | 'publishers' | 'books';

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  lowStockThreshold?: number;
}

export interface AnalyticsResponse {
  summary: {
    totalOrders: number;
    totalRevenue: string;
    totalBooksSold: number;
    averageCheck: string;
    avgDeliveryHours: number;
  };
  periodComparison: {
    totalOrdersDelta: number | null;
    totalRevenueDelta: number | null;
    totalBooksSoldDelta: number | null;
    averageCheckDelta: number | null;
  } | null;
  salesOverTime: { date: string; value: string }[];
  salesByCategory: { category: string; count: number }[];
  topSellingBooks: { title: string; soldCount: number }[];
  slowMovingBooks: { title: string; soldCount: number }[];
  ordersByStatus: Record<string, number>;
  customerMetrics: {
    uniqueCustomers: number;
    topCustomers: { username: string; fullName: string; ordersCount: number; totalSpent: string }[];
  };
  returnMetrics: {
    returnRequested: number;
    returned: number;
    returnedRevenue: string;
  };
  stockMetrics: {
    outOfStockCount: number;
    lowStockBooks: { title: string; stockQuantity: number }[];
  };
}

export const analyticsApi = {
  get: (params?: AnalyticsParams) => {
    const p = new URLSearchParams();
    if (params?.startDate) p.set('startDate', params.startDate);
    if (params?.endDate) p.set('endDate', params.endDate);
    if (params?.lowStockThreshold !== undefined) p.set('lowStockThreshold', String(params.lowStockThreshold));
    return apiClient.get<AnalyticsResponse>(`/analytics?${p}`);
  },
};

export const importExportApi = {
  export: (entity: CatalogEntity) =>
    apiClient.get(`/catalog/io/export/${entity}`, { responseType: 'blob' }),
  import: async (entity: CatalogEntity, file: File) => {
    const text = await file.text();
    const json = JSON.parse(text);
    return apiClient.post(`/catalog/io/import/${entity}`, json, {
      headers: { 'Content-Type': 'application/json' },
      skipErrorToast: true,
    });
  },
};
