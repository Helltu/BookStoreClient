"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { genresApi } from "@/lib/api/manager";
import type { Genre } from "@/lib/types/manager";

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Genre | null>(null);
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
      loadGenres();
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await genresApi.delete(deleteTarget.id);
      toast.success("Жанр удалён");
      setDeleteTarget(null);
      loadGenres();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const filtered = genres.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Жанры</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить жанр
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск жанров..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Ничего не найдено" : "Жанры не добавлены"}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead className="w-28 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((genre) => (
                <TableRow key={genre.id}>
                  <TableCell className="font-medium">{genre.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(genre)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(genre)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить жанр?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Вы уверены, что хотите удалить жанр &laquo;{deleteTarget?.name}&raquo;? Это действие нельзя отменить.
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
