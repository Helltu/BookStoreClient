"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Upload, ChevronUp, ChevronDown, ChevronsUpDown, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authorsApi } from "@/lib/api/manager";
import { ManagerPagination } from "@/components/manager/manager-pagination";
import { revalidateCatalogTag } from "@/app/actions/revalidate";
import { cn } from "@/lib/utils";
import type { Author } from "@/lib/types/manager";

type SortField = "name";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

export default function AuthorsPage() {
  const router = useRouter();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deleted">("all");
  const [page, setPage] = useState(() => {
    const saved = sessionStorage.getItem("manager-authors-page");
    if (saved) { sessionStorage.removeItem("manager-authors-page"); return parseInt(saved); }
    return 0;
  });
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formName, setFormName] = useState("");
  const [formBiography, setFormBiography] = useState("");
  const [formPhoto, setFormPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [forceDeleteTarget, setForceDeleteTarget] = useState<Author | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [scrollReady, setScrollReady] = useState(() => !sessionStorage.getItem("manager-authors-scroll"));

  const loadAuthors = useCallback(async () => {
    try {
      const res = await authorsApi.getAll();
      setAuthors(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAuthors(); }, [loadAuthors]);

  useEffect(() => {
    if (loading) return;
    const saved = sessionStorage.getItem("manager-authors-scroll");
    if (saved) {
      sessionStorage.removeItem("manager-authors-scroll");
      requestAnimationFrame(() => requestAnimationFrame(() => { tableRef.current?.scrollTo({ top: parseInt(saved) }); setScrollReady(true); }));
    }
  }, [loading]);

  useEffect(() => {
    if (!lightboxUrl) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setLightboxUrl(null); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [lightboxUrl]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };

  const openCreate = () => {
    setEditingAuthor(null);
    setFormName("");
    setFormBiography("");
    setFormPhoto(null);
    setDialogOpen(true);
  };

  const openEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormName(author.name);
    setFormBiography(author.biography ?? "");
    setFormPhoto(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        biography: formBiography.trim() || undefined,
        photo: formPhoto,
      };
      if (editingAuthor) {
        await authorsApi.update(editingAuthor.id, payload);
        toast.success("Автор обновлён");
      } else {
        await authorsApi.create(payload);
        toast.success("Автор создан");
      }
      setDialogOpen(false);
      await revalidateCatalogTag("authors");
      loadAuthors();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await authorsApi.delete(deleteTarget.id);
      toast.success("Автор удалён");
      setDeleteTarget(null);
      await revalidateCatalogTag("authors");
      loadAuthors();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!forceDeleteTarget) return;
    setDeleting(true);
    try {
      await authorsApi.forceDelete(forceDeleteTarget.id);
      toast.success("Автор удалён безвозвратно");
      setForceDeleteTarget(null);
      await revalidateCatalogTag("authors");
      loadAuthors();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (author: Author) => {
    try {
      await authorsApi.restore(author.id);
      toast.success("Автор восстановлен");
      await revalidateCatalogTag("authors");
      loadAuthors();
    } catch {
      // handled by interceptor
    }
  };

  const PAGE_SIZE = 20;
  const q = search.toLowerCase();
  const filtered = authors.filter((a) => {
    if (statusFilter === "active" && a.deletedAt) return false;
    if (statusFilter === "deleted" && !a.deletedAt) return false;
    return a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.biography ?? "").toLowerCase().includes(q);
  });
  const sorted = [...filtered].sort((a, b) => {
    const cmp = a[sortField].localeCompare(b[sortField]);
    return sortDir === "asc" ? cmp : -cmp;
  });
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const thClass = "cursor-pointer select-none hover:bg-muted/50 transition-colors";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Авторы</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить автора
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ID, имени, биографии..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-md border border-input overflow-hidden text-sm">
          {(["all", "active", "deleted"] as const).map((v) => (
            <button
              key={v}
              onClick={() => { setStatusFilter(v); setPage(0); }}
              className={`px-3 h-8 transition-colors ${statusFilter === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
            >
              {v === "all" ? "Все" : v === "active" ? "Активные" : "Удалённые"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Ничего не найдено" : "Авторы не добавлены"}
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div ref={tableRef} className={`rounded-lg border overflow-auto flex-1 min-h-0 transition-opacity duration-100${!scrollReady ? " opacity-0" : ""}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Фото</TableHead>
                  <TableHead className={thClass} onClick={() => toggleSort("name")}>
                    <span className="flex items-center">Имя <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Биография</TableHead>
                  <TableHead className="hidden xl:table-cell w-72 text-muted-foreground font-normal">ID</TableHead>
                  <TableHead className="w-36 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((author) => {
                  const isDeleted = !!author.deletedAt;
                  return (
                    <TableRow
                      key={author.id}
                      className={cn(
                        "cursor-pointer",
                        isDeleted ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30" : "hover:bg-muted/40"
                      )}
                      onClick={() => { sessionStorage.setItem("manager-authors-scroll", String(tableRef.current?.scrollTop ?? 0)); sessionStorage.setItem("manager-authors-page", String(page)); router.push(`/author/${encodeURIComponent(author.name)}`); }}
                    >
                      <TableCell>
                        {author.photoUrl ? (
                          <img
                            src={author.photoUrl}
                            alt={author.name}
                            className="h-10 w-10 rounded-full object-cover cursor-zoom-in hover:opacity-80 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); setLightboxUrl(author.photoUrl!); }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/author/${encodeURIComponent(author.name)}`} className="hover:underline" onClick={() => { sessionStorage.setItem("manager-authors-scroll", String(tableRef.current?.scrollTop ?? 0)); sessionStorage.setItem("manager-authors-page", String(page)); }}>{author.name}</Link>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                        {author.biography || "—"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{author.id}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isDeleted ? (
                            <>
                              <Button variant="ghost" size="icon" title="Восстановить" onClick={(e) => { e.stopPropagation(); handleRestore(author); }}>
                                <RotateCcw className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Удалить безвозвратно" onClick={(e) => { e.stopPropagation(); setForceDeleteTarget(author); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(author); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(author); }}>
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
          <ManagerPagination page={page} totalPages={totalPages} onPageChange={setPage} tableRef={tableRef} totalItems={sorted.length} pageSize={PAGE_SIZE} />
        </div>
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
            alt="Фото автора"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAuthor ? "Редактировать автора" : "Новый автор"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="author-name">Имя *</Label>
              <Input
                id="author-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Лев Толстой"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author-bio">Биография</Label>
              <Textarea
                id="author-bio"
                value={formBiography}
                onChange={(e) => setFormBiography(e.target.value)}
                placeholder="Краткая биография автора..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Фото</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFormPhoto(e.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" className="w-full gap-2 overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 shrink-0" />
                <span className="truncate">{formPhoto ? formPhoto.name : "Выбрать файл"}</span>
              </Button>
              {editingAuthor?.photoUrl && !formPhoto && (
                <p className="text-xs text-muted-foreground">Текущее фото загружено. Выберите новый файл для замены.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Soft delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить автора?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Автор &laquo;{deleteTarget?.name}&raquo; будет удалён. Если к нему привязаны книги — он будет скрыт и его можно восстановить. Иначе — удалён безвозвратно.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleSoftDelete} disabled={deleting}>
              {deleting ? "Удаление..." : "Удалить"}
            </Button>
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
            Автор &laquo;{forceDeleteTarget?.name}&raquo; будет удалён из базы данных. Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForceDeleteTarget(null)}>Отмена</Button>
            <Button variant="destructive" onClick={handleForceDelete} disabled={deleting}>
              {deleting ? "Удаление..." : "Удалить безвозвратно"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
