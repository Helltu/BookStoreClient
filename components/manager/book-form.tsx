"use client";

import { useEffect, useState, useRef } from "react";
import { X, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { genresApi, authorsApi, publishersApi } from "@/lib/api/manager";
import type { Genre, Author, Publisher, BookFormData } from "@/lib/types/manager";

interface BookFormProps {
  initialData?: Partial<BookFormData> & {
    currentAuthorNames?: string[];
    currentGenreNames?: string[];
    currentPublisherName?: string;
  };
  onSubmit: (data: BookFormData) => Promise<void>;
  submitLabel: string;
}

export function BookForm({ initialData, onSubmit, submitLabel }: BookFormProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [form, setForm] = useState<BookFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 0,
    isbn: initialData?.isbn ?? "",
    stock: initialData?.stock ?? 0,
    authorIds: initialData?.authorIds ?? [],
    genreIds: initialData?.genreIds ?? [],
    publisherId: initialData?.publisherId ?? null,
    keywords: initialData?.keywords ?? [],
    coverFile: null,
    previewFiles: [],
  });

  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadRefs() {
      try {
        const [g, a, p] = await Promise.all([
          genresApi.getAll(),
          authorsApi.getAll(),
          publishersApi.getAll(),
        ]);
        setGenres(g.data);
        setAuthors(a.data);
        setPublishers(p.data);

        if (initialData?.currentAuthorNames) {
          const matchedIds = a.data
            .filter((author) => initialData.currentAuthorNames!.includes(author.name))
            .map((author) => author.id);
          setForm((prev) => ({ ...prev, authorIds: matchedIds }));
        }
        if (initialData?.currentGenreNames) {
          const matchedIds = g.data
            .filter((genre) => initialData.currentGenreNames!.includes(genre.name))
            .map((genre) => genre.id);
          setForm((prev) => ({ ...prev, genreIds: matchedIds }));
        }
        if (initialData?.currentPublisherName) {
          const matched = p.data.find((pub) => pub.name === initialData.currentPublisherName);
          if (matched) {
            setForm((prev) => ({ ...prev, publisherId: matched.id }));
          }
        }
      } catch {
        // handled by interceptor
      } finally {
        setLoadingRefs(false);
      }
    }
    loadRefs();
  }, []);

  const updateField = <K extends keyof BookFormData>(key: K, value: BookFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAuthor = (id: string) => {
    setForm((prev) => ({
      ...prev,
      authorIds: prev.authorIds.includes(id)
        ? prev.authorIds.filter((a) => a !== id)
        : [...prev.authorIds, id],
    }));
  };

  const toggleGenre = (id: string) => {
    setForm((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(id)
        ? prev.genreIds.filter((g) => g !== id)
        : [...prev.genreIds, id],
    }));
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    updateField("keywords", [...form.keywords, newKeyword.trim()]);
    setNewKeyword("");
  };

  const removeKeyword = (index: number) => {
    updateField("keywords", form.keywords.filter((_, i) => i !== index));
  };

  const handlePreviewFiles = (files: FileList | null) => {
    if (!files) return;
    updateField("previewFiles", [...form.previewFiles, ...Array.from(files)]);
  };

  const removePreviewFile = (index: number) => {
    updateField("previewFiles", form.previewFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  if (loadingRefs) {
    return <div className="text-center py-12 text-muted-foreground">Загрузка данных...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Основная информация</h2>

        <div className="space-y-2">
          <Label htmlFor="title">Название *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Война и мир"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Краткое описание книги..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Цена (BYN) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={form.price || ""}
              onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Кол-во на складе *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={form.stock || ""}
              onChange={(e) => updateField("stock", parseInt(e.target.value) || 0)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="isbn">ISBN</Label>
            <Input
              id="isbn"
              value={form.isbn}
              onChange={(e) => updateField("isbn", e.target.value)}
              placeholder="978-3-16-148410-0"
            />
          </div>
        </div>
      </section>

      {/* Publisher */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Издательство</h2>
        <div className="space-y-2">
          <Label htmlFor="publisher">Издательство</Label>
          <select
            id="publisher"
            value={form.publisherId ?? ""}
            onChange={(e) => updateField("publisherId", e.target.value || null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Не выбрано</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Authors */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Авторы</h2>
        {form.authorIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.authorIds.map((id) => {
              const author = authors.find((a) => a.id === id);
              if (!author) return null;
              return (
                <Badge key={id} variant="secondary" className="gap-1 pr-1">
                  {author.name}
                  <button type="button" onClick={() => toggleAuthor(id)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {authors.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Нет доступных авторов</p>
          ) : (
            authors.map((author) => (
              <label
                key={author.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={form.authorIds.includes(author.id)}
                  onChange={() => toggleAuthor(author.id)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm">{author.name}</span>
              </label>
            ))
          )}
        </div>
      </section>

      {/* Genres */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Жанры</h2>
        {form.genreIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.genreIds.map((id) => {
              const genre = genres.find((g) => g.id === id);
              if (!genre) return null;
              return (
                <Badge key={id} variant="secondary" className="gap-1 pr-1">
                  {genre.name}
                  <button type="button" onClick={() => toggleGenre(id)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {genres.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Нет доступных жанров</p>
          ) : (
            genres.map((genre) => (
              <label
                key={genre.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
              >
                <input
                  type="checkbox"
                  checked={form.genreIds.includes(genre.id)}
                  onChange={() => toggleGenre(genre.id)}
                  className="h-4 w-4 rounded border-input"
                />
                <span className="text-sm">{genre.name}</span>
              </label>
            ))
          )}
        </div>
      </section>

      {/* Keywords */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Ключевые слова</h2>
        <p className="text-sm text-muted-foreground">Оставьте пустым для автоматической генерации.</p>
        {form.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.keywords.map((kw, i) => (
              <Badge key={i} variant="outline" className="gap-1 pr-1">
                {kw}
                <button type="button" onClick={() => removeKeyword(i)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Введите ключевое слово"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addKeyword();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addKeyword}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Files */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Изображения</h2>

        <div className="space-y-2">
          <Label>Обложка</Label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => updateField("coverFile", e.target.files?.[0] ?? null)}
          />
          <Button type="button" variant="outline" className="w-full gap-2" onClick={() => coverInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            {form.coverFile ? form.coverFile.name : "Выбрать обложку"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Дополнительные изображения</Label>
          <input
            ref={previewInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handlePreviewFiles(e.target.files)}
          />
          <Button type="button" variant="outline" className="w-full gap-2" onClick={() => previewInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Добавить изображения
          </Button>
          {form.previewFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.previewFiles.map((file, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {file.name}
                  <button type="button" onClick={() => removePreviewFile(i)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={saving || !form.title.trim()}>
          {saving ? "Сохранение..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
