"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { authorsApi } from "@/lib/api/manager";
import type { Author } from "@/lib/types/manager";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formName, setFormName] = useState("");
  const [formBiography, setFormBiography] = useState("");
  const [formPhoto, setFormPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Author | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      loadAuthors();
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
      await authorsApi.delete(deleteTarget.id);
      toast.success("Автор удалён");
      setDeleteTarget(null);
      loadAuthors();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const filtered = authors.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Авторы</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить автора
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск авторов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Ничего не найдено" : "Авторы не добавлены"}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Фото</TableHead>
                <TableHead>Имя</TableHead>
                <TableHead className="hidden md:table-cell">Биография</TableHead>
                <TableHead className="w-28 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    {author.photoUrl ? (
                      <img src={author.photoUrl} alt={author.name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                    {author.biography || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(author)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(author)}>
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
              <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                {formPhoto ? formPhoto.name : "Выбрать файл"}
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

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить автора?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Вы уверены, что хотите удалить автора &laquo;{deleteTarget?.name}&raquo;? Это действие нельзя отменить.
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
