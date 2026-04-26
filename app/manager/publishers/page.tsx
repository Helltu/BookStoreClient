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
import { publishersApi } from "@/lib/api/manager";
import type { Publisher } from "@/lib/types/manager";

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLogo, setFormLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Publisher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPublishers = useCallback(async () => {
    try {
      const res = await publishersApi.getAll();
      setPublishers(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPublishers(); }, [loadPublishers]);

  const openCreate = () => {
    setEditingPublisher(null);
    setFormName("");
    setFormDescription("");
    setFormLogo(null);
    setDialogOpen(true);
  };

  const openEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    setFormName(publisher.name);
    setFormDescription(publisher.description ?? "");
    setFormLogo(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        logo: formLogo,
      };
      if (editingPublisher) {
        await publishersApi.update(editingPublisher.id, payload);
        toast.success("Издательство обновлено");
      } else {
        await publishersApi.create(payload);
        toast.success("Издательство создано");
      }
      setDialogOpen(false);
      loadPublishers();
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
      await publishersApi.delete(deleteTarget.id);
      toast.success("Издательство удалено");
      setDeleteTarget(null);
      loadPublishers();
    } catch {
      // handled by interceptor
    } finally {
      setDeleting(false);
    }
  };

  const filtered = publishers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Издательства</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить издательство
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск издательств..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? "Ничего не найдено" : "Издательства не добавлены"}
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Лого</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="hidden md:table-cell">Описание</TableHead>
                <TableHead className="w-28 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((publisher) => (
                <TableRow key={publisher.id}>
                  <TableCell>
                    {publisher.logoUrl ? (
                      <img src={publisher.logoUrl} alt={publisher.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{publisher.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                    {publisher.description || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(publisher)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(publisher)}>
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
            <DialogTitle>{editingPublisher ? "Редактировать издательство" : "Новое издательство"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="pub-name">Название *</Label>
              <Input
                id="pub-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Эксмо"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub-desc">Описание</Label>
              <Textarea
                id="pub-desc"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Краткое описание издательства..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Логотип</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFormLogo(e.target.files?.[0] ?? null)}
              />
              <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                {formLogo ? formLogo.name : "Выбрать файл"}
              </Button>
              {editingPublisher?.logoUrl && !formLogo && (
                <p className="text-xs text-muted-foreground">Текущий логотип загружен. Выберите новый файл для замены.</p>
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
            <DialogTitle>Удалить издательство?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Вы уверены, что хотите удалить издательство &laquo;{deleteTarget?.name}&raquo;? Это действие нельзя отменить.
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
