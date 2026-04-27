"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { BookForm } from "@/components/manager/book-form";
import { booksApi } from "@/lib/api/manager";
import type { BookFormData, ManagedBook } from "@/lib/types/manager";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [book, setBook] = useState<ManagedBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await booksApi.getById(params.id);
        setBook(res.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleSubmit = async (data: BookFormData) => {
    try {
      await booksApi.update(params.id, data);
      toast.success("Книга обновлена");
      router.push("/manager/books");
    } catch {
      // handled by interceptor
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Загрузка...</div>;
  }

  if (!book) {
    return <div className="text-center py-12 text-muted-foreground">Книга не найдена</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Редактирование: {book.title}</h1>
      <BookForm
        bookId={params.id}
        initialData={{
          title: book.title,
          description: book.description,
          price: book.price,
          isbn: book.isbn ?? "",
          stockQuantity: book.stockQuantity ?? 0,
          keywords: book.keywords ?? [],
          currentAuthorNames: book.authors,
          currentGenreNames: book.genres,
          currentPublisherName: book.publisher ?? undefined,
          coverUrl: book.coverUrl,
          previewUrls: book.previewUrls,
        }}
        onSubmit={handleSubmit}
        submitLabel="Сохранить изменения"
      />
    </div>
  );
}
