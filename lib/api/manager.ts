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
  getAll: (page: number, size: number, query?: string, inStock?: boolean) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (query) params.set('query', query);
    if (inStock !== undefined) params.set('inStock', String(inStock));
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
    fd.append('isbn', data.isbn);
    fd.append('price', String(data.price));
    fd.append('stock', String(data.stockQuantity));
    data.authorIds.forEach((aid) => fd.append('authorIds', aid));
    data.genreIds.forEach((gid) => fd.append('genreIds', gid));
    if (data.publisherId) fd.append('publisherId', data.publisherId);
    data.keywords.forEach((kw) => fd.append('keywords', kw));
    if (data.coverFile) fd.append('coverFile', data.coverFile);
    data.previewFiles.forEach((file) => fd.append('previewFiles', file));
    return apiClient.put<void>(`/catalog/books/${id}`, fd, multipartConfig());
  },
  adjustStock: (id: string, stockQuantity: number) =>
    apiClient.patch<void>(`/catalog/books/${id}/stock`, { quantity: stockQuantity }),
  delete: (id: string) => apiClient.delete(`/catalog/books/${id}`),
  generateKeywords: (id: string) => apiClient.post<void>(`/catalog/books/${id}/keywords/generate`, {}),
  generateDescription: (id: string) => apiClient.post<string>(`/catalog/books/${id}/description/generate`, {}),
};
