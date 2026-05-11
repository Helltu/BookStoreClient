"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, Search, Package, ChevronUp, ChevronDown, ChevronsUpDown, X, Download, Star, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { booksApi } from "@/lib/api/manager";
import { ManagerPagination } from "@/components/manager/manager-pagination";
import { ManagerBookFilterSidebar, type ManagerBookFilters } from "@/components/manager/manager-book-filter-sidebar";
import { cn } from "@/lib/utils";
import type { ManagedBook } from "@/lib/types/manager";

const PAGE_SIZE = 15;

type SortField = "title" | "price" | "stockQuantity" | "averageRating" | "createdAt";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

export default function BooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<ManagedBook[]>([]);
  const [loading, setLoading] = useState(true);

  const [importOpen, setImportOpen] = useState(false);
  const [importIsbn, setImportIsbn] = useState("");
  const [importPrice, setImportPrice] = useState("");
  const [importStock, setImportStock] = useState("");
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await booksApi.importByIsbn(importIsbn.trim(), parseFloat(importPrice), parseInt(importStock));
      toast.success("Книга импортирована");
      setImportOpen(false);
      const uuidMatch = String(res.data).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      if (uuidMatch) {
        router.push(`/manager/books/${uuidMatch[0]}/edit`);
      } else {
        loadBooks();
      }
    } catch {
      // handled by interceptor
    } finally {
      setImporting(false);
    }
  };

  const importValid = importIsbn.trim().length > 0 && parseFloat(importPrice) > 0 && parseInt(importStock) >= 0;
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [bookFilters, setBookFilters] = useState<ManagerBookFilters>(() => {
    const genre = searchParams.get("genre");
    return { genres: genre ? [genre] : [], authors: [], publisher: "", minPrice: "", maxPrice: "", language: "", format: "", ageRating: "", minYear: "", maxYear: "", minRating: "", inStock: false, showDeleted: false };
  });

  const [deleteTarget, setDeleteTarget] = useState<ManagedBook | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [stockTarget, setStockTarget] = useState<ManagedBook | null>(null);
  const [stockInput, setStockInput] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const [restoreTarget, setRestoreTarget] = useState<ManagedBook | null>(null);
  const [forceDeleteTarget, setForceDeleteTarget] = useState<ManagedBook | null>(null);
  const [forceDeleting, setForceDeleting] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await booksApi.getAll(
        page, PAGE_SIZE,
        search || undefined,
        bookFilters.inStock || undefined,
        `${sortField},${sortDir}`,
        bookFilters.genres.length ? bookFilters.genres : undefined,
        bookFilters.authors.length ? bookFilters.authors : undefined,
        bookFilters.publisher || undefined,
        bookFilters.minPrice || undefined,
        bookFilters.maxPrice || undefined,
        bookFilters.language || undefined,
        bookFilters.format || undefined,
        bookFilters.ageRating || undefined,
        bookFilters.minYear || undefined,
        bookFilters.maxYear || undefined,
        bookFilters.minRating || undefined,
        bookFilters.showDeleted || undefined,
      );
      setBooks(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [page, search, sortField, sortDir, bookFilters]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  useEffect(() => {
    const timer = setTimeout(() => { setPage(0); setSearch(searchInput.trim()); }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!lightboxUrl) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [lightboxUrl]);

  const toggleSort = (field: SortField) => {
    setPage(0);
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

  const handleRestore = async () => {
    if (!restoreTarget) return;
    try {
      await booksApi.restore(restoreTarget.id);
      toast.success("Книга восстановлена");
      setRestoreTarget(null);
      loadBooks();
    } catch {
      // handled by interceptor
    }
  };

  const handleForceDelete = async () => {
    if (!forceDeleteTarget) return;
    setForceDeleting(true);
    try {
      await booksApi.forceDelete(forceDeleteTarget.id);
      toast.success("Книга удалена безвозвратно");
      setForceDeleteTarget(null);
      loadBooks();
    } catch {
      // handled by interceptor
    } finally {
      setForceDeleting(false);
    }
  };

  const thClass = "cursor-pointer select-none hover:bg-muted/50 transition-colors";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Книги</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setImportIsbn(""); setImportPrice(""); setImportStock(""); setImportOpen(true); }}>
            <Download className="h-4 w-4 mr-2" />
            Импорт по ISBN
          </Button>
          <Button asChild>
            <Link href="/manager/books/new">
              <Plus className="h-4 w-4 mr-2" />
              Добавить книгу
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ID, названию, ISBN..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 w-72"
          />
        </div>
        <ManagerBookFilterSidebar
          filters={bookFilters}
          onChange={(f) => { setPage(0); setBookFilters(f); }}
          showDeletedFilter
        />
      </div>

      {(loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : books.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {bookFilters.showDeleted ? "Удалённых книг нет" : search || bookFilters.inStock ? "Ничего не найдено" : "Книги не добавлены"}
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div ref={tableRef} className="rounded-lg border overflow-auto flex-1 min-h-0">
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
                  <TableHead className={`${thClass} hidden lg:table-cell`} onClick={() => toggleSort("averageRating")}>
                    <span className="flex items-center">Отзывы <SortIcon field="averageRating" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell w-72 text-muted-foreground font-normal">ID</TableHead>
                  <TableHead className="w-32 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => {
                  const isDeleted = !!book.deletedAt;
                  return (
                  <TableRow
                    key={book.id}
                    className={cn(
                      "cursor-pointer",
                      isDeleted ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30" : "hover:bg-muted/40"
                    )}
                    onClick={() => router.push(`/book/${book.id}`)}
                  >
                    <TableCell>
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="h-14 w-10 object-cover rounded cursor-zoom-in hover:opacity-80 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setLightboxUrl(book.coverUrl!); }}
                        />
                      ) : (
                        <div className="h-14 w-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/book/${book.id}`} className="font-medium hover:underline">{book.title}</Link>
                      <div className="text-xs text-muted-foreground mt-0.5">ISBN: {book.isbn || "—"}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {book.authors?.map((a, i) => (
                          <span key={i}>{i > 0 && ", "}
                            <Link href={`/author/${encodeURIComponent(a)}`} className="hover:underline">{a}</Link>
                          </span>
                        )) || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(book.genres ?? []).slice(0, 3).map((g, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{g}</Badge>
                        ))}
                        {(book.genres ?? []).length > 3 && (
                          <Badge variant="outline" className="text-xs">+{book.genres!.length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">
                      {book.price.toFixed(2)} р.
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge variant={(book.stockQuantity ?? 0) > 0 ? "default" : "destructive"} className="text-xs">
                        {book.stockQuantity ?? 0} шт.
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap">
                      {(book.totalReviews ?? 0) > 0 ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span className="font-medium">{(book.averageRating ?? 0).toFixed(1)}</span>
                          <span className="text-muted-foreground">({book.totalReviews})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{book.id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isDeleted ? (
                          <>
                            <Button variant="ghost" size="icon" title="Восстановить" onClick={(e) => { e.stopPropagation(); setRestoreTarget(book); }}>
                              <RotateCcw className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Удалить безвозвратно" onClick={(e) => { e.stopPropagation(); setForceDeleteTarget(book); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" title="Изменить остаток" onClick={(e) => { e.stopPropagation(); openStockDialog(book); }}>
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
                              <Link href={`/manager/books/${book.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(book); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ManagerPagination page={page} totalPages={totalPages} onPageChange={setPage} tableRef={tableRef} totalItems={totalElements} pageSize={PAGE_SIZE} />
        </div>
      ))}

      {/* Restore confirmation */}
      <Dialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Восстановить книгу?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Книга &laquo;{restoreTarget?.title}&raquo; снова появится в каталоге.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>Отмена</Button>
            <Button onClick={handleRestore}>Восстановить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force delete confirmation */}
      <Dialog open={!!forceDeleteTarget} onOpenChange={(open) => !open && setForceDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить безвозвратно?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Книга &laquo;{forceDeleteTarget?.title}&raquo; будет удалена из базы данных. Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForceDeleteTarget(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleForceDelete} disabled={forceDeleting}>
              {forceDeleting ? "Удаление..." : "Удалить безвозвратно"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import by ISBN */}
      <Dialog open={importOpen} onOpenChange={(open) => !open && setImportOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Импорт книги по ISBN</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Данные будут загружены из Google Books API</p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="import-isbn">ISBN *</Label>
              <Input
                id="import-isbn"
                placeholder="978-3-16-148410-0"
                value={importIsbn}
                onChange={(e) => setImportIsbn(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="import-price">Цена (р.) *</Label>
              <Input
                id="import-price"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="29.99"
                value={importPrice}
                onChange={(e) => setImportPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="import-stock">Начальный остаток *</Label>
              <Input
                id="import-stock"
                type="number"
                min="0"
                placeholder="10"
                value={importStock}
                onChange={(e) => setImportStock(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && importValid && !importing && handleImport()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>Отмена</Button>
            <Button onClick={handleImport} disabled={!importValid || importing}>
              {importing ? "Импорт..." : "Импортировать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            Книга &laquo;{deleteTarget?.title}&raquo; будет удалена. Если по ней есть заказы — она будет скрыта из каталога и её можно восстановить. Иначе — удалена безвозвратно.
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
