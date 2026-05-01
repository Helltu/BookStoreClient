"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Upload, ChevronUp, ChevronDown, ChevronsUpDown, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { publishersApi } from "@/lib/api/manager";
import { ManagerPagination } from "@/components/manager/manager-pagination";
import type { Publisher } from "@/lib/types/manager";

type SortField = "name";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

export default function PublishersPage() {
  const router = useRouter();
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formLogo, setFormLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<Publisher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

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

  const PAGE_SIZE = 20;
  const q = search.toLowerCase();
  const filtered = publishers.filter((p) =>
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    (p.description ?? "").toLowerCase().includes(q)
  );
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
        <h1 className="text-2xl font-bold">Издательства</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить издательство
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по ID, названию, описанию..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
        <div className="flex flex-col flex-1 min-h-0">
          <div ref={tableRef} className="rounded-lg border overflow-auto flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Лого</TableHead>
                  <TableHead className={thClass} onClick={() => toggleSort("name")}>
                    <span className="flex items-center">Название <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Описание</TableHead>
                  <TableHead className="hidden xl:table-cell w-72 text-muted-foreground font-normal">ID</TableHead>
                  <TableHead className="w-28 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((publisher) => (
                  <TableRow key={publisher.id} className="cursor-pointer hover:bg-muted/40" onClick={() => router.push(`/publisher/${encodeURIComponent(publisher.name)}`)}>

                    <TableCell>
                      {publisher.logoUrl ? (
                        <img
                          src={publisher.logoUrl}
                          alt={publisher.name}
                          className="h-10 w-10 rounded object-cover cursor-zoom-in hover:opacity-80 transition-opacity"
                          onClick={() => setLightboxUrl(publisher.logoUrl!)}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          —
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium"><Link href={`/publisher/${encodeURIComponent(publisher.name)}`} className="hover:underline">{publisher.name}</Link></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                      {publisher.description || "—"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell font-mono text-xs text-muted-foreground">{publisher.id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(publisher); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteTarget(publisher); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ManagerPagination page={page} totalPages={totalPages} onPageChange={setPage} tableRef={tableRef} />
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
            alt="Логотип издательства"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
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
