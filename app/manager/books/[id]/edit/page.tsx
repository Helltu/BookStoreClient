"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { BookForm } from "@/components/manager/book-form";
import { booksApi } from "@/lib/api/manager";
import type { BookFormData, ManagedBook } from "@/lib/types/manager";
import { revalidateBook } from "@/app/actions";
import { revalidateCatalogTag } from "@/app/actions/revalidate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function EditBookPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<ManagedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!book) return;
    setDeleting(true);
    try {
      if (book.deletedAt) {
        await booksApi.forceDelete(params.id);
        toast.success("Книга удалена безвозвратно");
      } else {
        await booksApi.delete(params.id);
        toast.success("Книга удалена");
      }
      await revalidateCatalogTag("books");
      router.push("/manager/books");
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (data: BookFormData) => {
    try {
      await booksApi.update(params.id, data);
      await revalidateBook(params.id);
      toast.success("Книга обновлена");
      window.location.reload();
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
      <div className="flex items-center justify-between mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold">Редактирование: {book.title}</h1>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/book/${params.id}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Просмотр в каталоге
          </Link>
        </Button>
      </div>
      <BookForm
        bookId={params.id}
        initialData={{
          title: book.title,
          description: book.description,
          price: book.price,
          isbn: book.isbn ?? "",
          stockQuantity: book.stockQuantity ?? 0,
          pagesCount: book.pagesCount ?? null,
          format: book.format ?? null,
          weight: book.weight ?? null,
          dimensions: book.dimensions ?? "",
          ageRating: book.ageRating ?? "",
          publicationYear: book.publicationYear ?? null,
          language: book.language ?? "",
          originalLanguage: book.originalLanguage ?? "",
          keywords: book.keywords ?? [],
          currentAuthorNames: book.authors,
          currentGenreNames: book.genres,
          currentPublisherName: book.publisher ?? undefined,
          coverUrl: book.coverUrl,
          previewUrls: book.previewUrls,
        }}
        onSubmit={handleSubmit}
        submitLabel="Сохранить изменения"
        onDelete={() => setDeleteOpen(true)}
        deleteLabel={book.deletedAt ? "Удалить безвозвратно" : "Удалить"}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{book.deletedAt ? "Удалить безвозвратно?" : "Удалить книгу?"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {book.deletedAt
              ? `Книга «${book.title}» будет удалена из базы данных. Это действие нельзя отменить.`
              : `Книга «${book.title}» будет удалена. Если по ней есть заказы — она будет скрыта из каталога и её можно восстановить. Иначе — удалена безвозвратно.`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Удаление..." : book.deletedAt ? "Удалить безвозвратно" : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
