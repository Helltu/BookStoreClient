'use client';

import { useEffect, useState } from 'react';
import { BookCard } from '@/components/book-card';
import { useAuthStore } from '@/store/useAuthStore';
import {
  fetchSimilarBooks,
  fetchFrequentlyBoughtWith,
  fetchPersonalRecommendations,
  type RecommendedBook,
} from '@/lib/api/recommendations';

type RecommendationType = 'similar' | 'frequently-bought-with' | 'personal';

interface Props {
  title: string;
  type: RecommendationType;
  bookId?: string;
}

function getFetchFn(type: RecommendationType, bookId?: string): () => Promise<RecommendedBook[]> {
  if (type === 'similar') return () => fetchSimilarBooks(bookId!);
  if (type === 'frequently-bought-with') return () => fetchFrequentlyBoughtWith(bookId!);
  return () => fetchPersonalRecommendations();
}

export function RecommendationSection({ title, type, bookId }: Props) {
  const user = useAuthStore((s) => s.user);
  const [books, setBooks] = useState<RecommendedBook[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getFetchFn(type, bookId)().then((data) => {
      setBooks(data);
      setLoaded(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, bookId]);

  if (user?.role === 'MANAGER') return null;
  if (!loaded || books.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={{
              id: book.id,
              title: book.title,
              authors: book.authors,
              price: book.price,
              coverUrl: book.coverUrl ?? undefined,
              averageRating: book.averageRating ?? undefined,
              totalReviews: book.totalReviews ?? undefined,
              description: '',
            }}
          />
        ))}
      </div>
    </section>
  );
}
