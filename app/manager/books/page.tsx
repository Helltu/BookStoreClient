"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { booksApi } from "@/lib/api/manager";
import type { ManagedBook } from "@/lib/types/manager";

const PAGE_SIZE = 15;

export default function BooksPage() {
  const [books, setBooks] = useState<ManagedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<ManagedBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await booksApi.getAll(page, PAGE_SIZE, search || undefined);
      setBooks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await booksApi.delete(deleteTarget.id);
      toast.success("Книга удалена");
      setDeleteTarget(null);
      loadBooks();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Книги</h1>
        <Button asChild>
          <Link href="/manager/books/new">
            <Plus className="h-4 w-4 mr-2" />
            Добавить книгу
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSearch} className="relative mb-4 max-w-sm flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск книг..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">Найти</Button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Ничего не найдено" : "Книги не добавлены"}
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Обложка</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead className="hidden lg:table-cell">Авторы</TableHead>
                  <TableHead className="hidden md:table-cell">Жанры</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="w-28 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="h-14 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-14 w-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        ISBN: {book.isbn || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {book.authors?.join(", ") || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(book.genres ?? []).slice(0, 3).map((g, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                        {(book.genres ?? []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{book.genres!.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">
                      {book.price.toFixed(2)} BYN
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/manager/books/${book.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(book)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить книгу?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Вы уверены, что хотите удалить книгу &laquo;{deleteTarget?.title}&raquo;? Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Удаление..." : "Удалить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
