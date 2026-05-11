"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown, ChevronsUpDown, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { genresApi } from "@/lib/api/manager";
import { ManagerPagination } from "@/components/manager/manager-pagination";
import { revalidateCatalogTag } from "@/app/actions/revalidate";
import { cn } from "@/lib/utils";
import type { Genre } from "@/lib/types/manager";

type SortField = "name";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

export default function GenresPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deleted">("all");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null);
  const [forceDeleteTarget, setForceDeleteTarget] = useState<Genre | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGenres = useCallback(async () => {
    try {
      const res = await genresApi.getAll();
      setGenres(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGenres(); }, [loadGenres]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
    setPage(0);
  };

  const openCreate = () => {
    setEditingGenre(null);
    setFormName("");
    setDialogOpen(true);
  };

  const openEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setFormName(genre.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      if (editingGenre) {
        await genresApi.update(editingGenre.id, { name: formName.trim() });
        toast.success("Жанр обновлён");
      } else {
        await genresApi.create({ name: formName.trim() });
        toast.success("Жанр создан");
      }
      setDialogOpen(false);
      await revalidateCatalogTag("genres");
      loadGenres();
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
      await genresApi.delete(deleteTarget.id);
      toast.success("Жанр удалён");
      setDeleteTarget(null);
      await revalidateCatalogTag("genres");
      loadGenres();
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
      await genresApi.forceDelete(forceDeleteTarget.id);
      toast.success("Жанр удалён безвозвратно");
      setForceDeleteTarget(null);
      await revalidateCatalogTag("genres");
      loadGenres();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const handleRestore = async (genre: Genre) => {
    try {
      await genresApi.restore(genre.id);
      toast.success("Жанр восстановлен");
      await revalidateCatalogTag("genres");
      loadGenres();
    } catch {
      // handled by interceptor
    }
  };

  const PAGE_SIZE = 20;
  const q = search.toLowerCase();
  const filtered = genres.filter((g) => {
    if (statusFilter === "active" && g.deletedAt) return false;
    if (statusFilter === "deleted" && !g.deletedAt) return false;
    return g.id.toLowerCase().includes(q) || g.name.toLowerCase().includes(q);
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
        <h1 className="text-2xl font-bold">Жанры</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить жанр
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по ID или названию..."
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
          {search ? "Ничего не найдено" : "Жанры не добавлены"}
        </div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div ref={tableRef} className="rounded-lg border overflow-auto flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass} onClick={() => toggleSort("name")}>
                    <span className="flex items-center">Название <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell w-72 text-muted-foreground font-normal">ID</TableHead>
                  <TableHead className="w-36 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((genre) => {
                  const isDeleted = !!genre.deletedAt;
                  return (
                    <TableRow
                      key={genre.id}
                      className={cn(
                        "cursor-pointer",
                        isDeleted ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30" : "hover:bg-muted/40"
                      )}
                      onClick={() => router.push(`/genre/${encodeURIComponent(genre.name)}`)}
                    >
                      <TableCell className="font-medium">
                        <Link href={`/genre/${encodeURIComponent(genre.name)}`} className="hover:underline">{genre.name}</Link>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{genre.id}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {isDeleted ? (
                            <>
                              <Button variant="ghost" size="icon" title="Восстановить" onClick={(e) => { e.stopPropagation(); handleRestore(genre); }}>
                                <RotateCcw className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Удалить безвозвратно" onClick={(e) => { e.stopPropagation(); setForceDeleteTarget(genre); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(genre); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(genre); }}>
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGenre ? "Редактировать жанр" : "Новый жанр"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="genre-name">Название</Label>
              <Input
                id="genre-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Например: Фантастика"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
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
            <DialogTitle>Удалить жанр?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Жанр &laquo;{deleteTarget?.name}&raquo; будет удалён. Если к нему привязаны книги — он будет скрыт и его можно восстановить. Иначе — удалён безвозвратно.
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
            Жанр &laquo;{forceDeleteTarget?.name}&raquo; будет удалён из базы данных. Это действие нельзя отменить.
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
