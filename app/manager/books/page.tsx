"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Package, ChevronUp, ChevronDown, ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { booksApi } from "@/lib/api/manager";
import type { ManagedBook } from "@/lib/types/manager";

const PAGE_SIZE = 15;

type SortField = "title" | "price" | "stockQuantity";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

export default function BooksPage() {
  const [books, setBooks] = useState<ManagedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [deleteTarget, setDeleteTarget] = useState<ManagedBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [stockTarget, setStockTarget] = useState<ManagedBook | null>(null);
  const [stockInput, setStockInput] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await booksApi.getAll(page, PAGE_SIZE, search || undefined, inStockOnly || undefined);
      setBooks(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, search, inStockOnly]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  useEffect(() => {
    if (!lightboxUrl) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [lightboxUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
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

  const openStockDialog = (book: ManagedBook) => {
    setStockTarget(book);
    setStockInput(String(book.stockQuantity ?? 0));
  };

  const handleAdjustStock = async () => {
    if (!stockTarget) return;
    const qty = parseInt(stockInput);
    if (isNaN(qty) || qty < 0) {
      toast.error("Введите корректное количество");
      return;
    }
    setAdjusting(true);
    try {
      await booksApi.adjustStock(stockTarget.id, qty);
      toast.success("Остаток обновлён");
      setStockTarget(null);
      loadBooks();
    } catch {
      // handled by interceptor
    } finally {
      setAdjusting(false);
    }
  };

  const sortedBooks = [...books].sort((a, b) => {
    let cmp = 0;
    if (sortField === "title") cmp = a.title.localeCompare(b.title);
    else if (sortField === "price") cmp = a.price - b.price;
    else if (sortField === "stockQuantity") cmp = (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const thClass = "cursor-pointer select-none hover:bg-muted/50 transition-colors";

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

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <form onSubmit={handleSearch} className="relative flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по ID, названию, ISBN..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-72"
            />
          </div>
          <Button type="submit" variant="secondary">Найти</Button>
        </form>

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => { setPage(0); setInStockOnly(e.target.checked); }}
            className="h-4 w-4 rounded border-input"
          />
          Только в наличии
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || inStockOnly ? "Ничего не найдено" : "Книги не добавлены"}
        </div>
      ) : (
        <>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Обложка</TableHead>
                  <TableHead className={thClass} onClick={() => toggleSort("title")}>
                    <span className="flex items-center">Название <SortIcon field="title" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Авторы</TableHead>
                  <TableHead className="hidden md:table-cell">Жанры</TableHead>
                  <TableHead className={`${thClass} text-right`} onClick={() => toggleSort("price")}>
                    <span className="flex items-center justify-end">Цена <SortIcon field="price" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className={`${thClass} text-right`} onClick={() => toggleSort("stockQuantity")}>
                    <span className="flex items-center justify-end">Склад <SortIcon field="stockQuantity" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell w-72 text-muted-foreground font-normal">ID</TableHead>
                  <TableHead className="w-32 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="h-14 w-10 object-cover rounded cursor-zoom-in hover:opacity-80 transition-opacity"
                          onClick={() => setLightboxUrl(book.coverUrl!)}
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
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge variant={(book.stockQuantity ?? 0) > 0 ? "default" : "destructive"} className="text-xs">
                        {book.stockQuantity ?? 0} шт.
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{book.id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Изменить остаток" onClick={() => openStockDialog(book)}>
                          <Package className="h-4 w-4" />
                        </Button>
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

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Обложка книги"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Stock adjust dialog */}
      <Dialog open={!!stockTarget} onOpenChange={(open) => !open && setStockTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Остаток на складе</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{stockTarget?.title}</p>
          <div className="space-y-2">
            <Label htmlFor="stock-input">Количество</Label>
            <Input
              id="stock-input"
              type="number"
              min="0"
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdjustStock()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockTarget(null)}>Отмена</Button>
            <Button onClick={handleAdjustStock} disabled={adjusting}>
              {adjusting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
