"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { X, Upload, Plus, Search, Sparkles, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { genresApi, authorsApi, publishersApi, booksApi } from "@/lib/api/manager";
import { toast } from "sonner";
import type { Genre, Author, Publisher, BookFormData } from "@/lib/types/manager";

interface BookFormProps {
  bookId?: string;
  initialData?: Partial<BookFormData> & {
    currentAuthorNames?: string[];
    currentGenreNames?: string[];
    currentPublisherName?: string;
    coverUrl?: string;
    previewUrls?: string[];
  };
  onSubmit: (data: BookFormData) => Promise<void>;
  submitLabel: string;
}

export function BookForm({ bookId, initialData, onSubmit, submitLabel }: BookFormProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  const [form, setForm] = useState<BookFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 0,
    isbn: initialData?.isbn ?? "",
    stockQuantity: initialData?.stockQuantity ?? 0,
    authorIds: initialData?.authorIds ?? [],
    genreIds: initialData?.genreIds ?? [],
    publisherId: initialData?.publisherId ?? null,
    keywords: initialData?.keywords ?? [],
    coverFile: null,
    previewFiles: [],
    keepPreviewUrls: initialData?.previewUrls ? [...initialData.previewUrls] : undefined,
  });

  const initialFormRef = useRef<BookFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingKeywords, setGeneratingKeywords] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [genreSearch, setGenreSearch] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [existingImages] = useState<string[]>([
    ...(initialData?.coverUrl ? [initialData.coverUrl] : []),
    ...(initialData?.previewUrls ?? []),
  ]);
  const [coverObjectUrl, setCoverObjectUrl] = useState<string | null>(null);
  const [previewObjectUrls, setPreviewObjectUrls] = useState<string[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  const allGalleryImages = useMemo(() => {
    const coverUrl = coverObjectUrl ?? existingImages[0];
    const keptPreviews = existingImages.slice(1).filter(
      (url) => form.keepPreviewUrls === undefined || form.keepPreviewUrls.includes(url)
    );
    return [
      ...(coverUrl ? [coverUrl] : []),
      ...keptPreviews,
      ...previewObjectUrls,
    ];
  }, [coverObjectUrl, existingImages, previewObjectUrls, form.keepPreviewUrls]);

  const openLightbox = (idx: number) => { setLightboxIndex(idx); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIndex((p) => (p + 1) % allGalleryImages.length);
      if (e.key === "ArrowLeft") setLightboxIndex((p) => (p - 1 + allGalleryImages.length) % allGalleryImages.length);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [lightboxOpen, allGalleryImages.length]);

  const handleGenerateKeywords = async () => {
    setGeneratingKeywords(true);
    try {
      const res = bookId
        ? await booksApi.generateKeywords(bookId)
        : await booksApi.suggestKeywords({
            title: form.title,
            description: form.description || null,
            existingKeywords: form.keywords,
          });
const keywords = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      updateField("keywords", keywords ?? []);
      toast.success("Ключевые слова сгенерированы");
    } catch {
      // handled by interceptor
    } finally {
      setGeneratingKeywords(false);
    }
  };

  const handleGenerateDescription = async () => {
    setGeneratingDescription(true);
    try {
      const res = bookId
        ? await booksApi.generateDescription(bookId)
        : await booksApi.suggestDescription({
            title: form.title,
            authors: form.authorIds
              .map((id) => authors.find((a) => a.id === id)?.name ?? "")
              .filter(Boolean)
              .join(", "),
            genres: form.genreIds
              .map((id) => genres.find((g) => g.id === id)?.name ?? "")
              .filter(Boolean)
              .join(", "),
          });
      updateField("description", res.data ?? "");
      toast.success("Описание сгенерировано");
    } catch {
      // handled by interceptor
    } finally {
      setGeneratingDescription(false);
    }
  };

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
        setForm((prev) => {
          initialFormRef.current = prev;
          return prev;
        });
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

  const removeExistingPreview = (url: string) => {
    updateField("keepPreviewUrls", (form.keepPreviewUrls ?? existingImages.slice(1)).filter((u) => u !== url));
  };

  const handlePreviewFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    updateField("previewFiles", [...form.previewFiles, ...newFiles]);
    setPreviewObjectUrls((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removePreviewFile = (index: number) => {
    updateField("previewFiles", form.previewFiles.filter((_, i) => i !== index));
    setPreviewObjectUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const isDirty = !bookId || !initialFormRef.current || (() => {
    const init = initialFormRef.current;
    return (
      form.title !== init.title ||
      form.description !== init.description ||
      form.price !== init.price ||
      form.isbn !== init.isbn ||
      form.stockQuantity !== init.stockQuantity ||
      form.publisherId !== init.publisherId ||
      form.coverFile !== null ||
      form.previewFiles.length > 0 ||
      JSON.stringify(form.authorIds.slice().sort()) !== JSON.stringify(init.authorIds.slice().sort()) ||
      JSON.stringify(form.genreIds.slice().sort()) !== JSON.stringify(init.genreIds.slice().sort()) ||
      JSON.stringify(form.keywords.slice().sort()) !== JSON.stringify(init.keywords.slice().sort()) ||
      JSON.stringify(form.keepPreviewUrls?.slice().sort()) !== JSON.stringify(init.keepPreviewUrls?.slice().sort())
    );
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      initialFormRef.current = form;
    } finally {
      setSaving(false);
    }
  };

  if (loadingRefs) {
    return <div className="text-center py-12 text-muted-foreground">Загрузка данных...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* Files */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Изображения</h2>

        {/* Media preview */}
        {(() => {
          const isNew = (url: string) => url.startsWith("blob:");
          return allGalleryImages.length > 0 ? (
          <div className="space-y-2">
            <Label>Изображения</Label>
            <div className="flex flex-col gap-3">
              <div
                onClick={() => openLightbox(0)}
                className="relative aspect-[2/3] w-40 cursor-pointer overflow-hidden rounded-xl border bg-muted shadow group"
              >
                <img
                  src={allGalleryImages[0]}
                  alt="Обложка"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                {isNew(allGalleryImages[0]) && (
                  <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full font-medium">новое</span>
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs backdrop-blur-sm">
                    <ZoomIn className="w-3 h-3" /> Открыть
                  </span>
                </div>
              </div>
              {allGalleryImages.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {allGalleryImages.slice(1).map((url, idx) => (
                    <div
                      key={url + idx}
                      onClick={() => openLightbox(idx + 1)}
                      className="relative aspect-[2/3] w-16 cursor-pointer overflow-hidden rounded-md border group"
                    >
                      <img
                        src={url}
                        alt={`Превью ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {isNew(url) ? (
                        <span className="absolute top-0.5 left-0.5 bg-primary text-primary-foreground text-[9px] px-1 py-0.5 rounded-full font-medium leading-none">new</span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeExistingPreview(url); }}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 hover:bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          ) : null;
        })()}

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-4 right-4 z-[60] p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <div
              className="hidden md:flex flex-col w-[120px] p-4 gap-3 overflow-y-auto border-r border-white/10 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {allGalleryImages.map((url, idx) => (
                <button
                  key={url + idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={cn(
                    "relative aspect-[2/3] shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all",
                    lightboxIndex === idx
                      ? "border-white opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "border-transparent opacity-40 hover:opacity-100 hover:border-white/50"
                  )}
                >
                  <img src={url} alt={`Миниатюра ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative flex items-center justify-center p-4">
              <img
                src={allGalleryImages[lightboxIndex]}
                alt={`Изображение ${lightboxIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {allGalleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => (p - 1 + allGalleryImages.length) % allGalleryImages.length); }}
                    className="absolute left-4 p-3 text-white/70 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex((p) => (p + 1) % allGalleryImages.length); }}
                    className="absolute right-4 p-3 text-white/70 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {lightboxIndex + 1} / {allGalleryImages.length}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Обложка</Label>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              updateField("coverFile", file);
              if (coverObjectUrl) URL.revokeObjectURL(coverObjectUrl);
              setCoverObjectUrl(file ? URL.createObjectURL(file) : null);
            }}
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
          <div className="flex items-center justify-between">
            <Label htmlFor="description">Описание</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={handleGenerateDescription}
              disabled={generatingDescription || !form.title.trim()}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generatingDescription ? "Генерация..." : "Сгенерировать ИИ"}
            </Button>
          </div>
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
            <Label htmlFor="stockQuantity">Кол-во на складе *</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => updateField("stockQuantity", parseInt(e.target.value) || 0)}
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
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-sans ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Найти автора..."
            value={authorSearch}
            onChange={(e) => setAuthorSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {(() => {
            const filteredAuthors = authors.filter((a) =>
              a.name.toLowerCase().includes(authorSearch.toLowerCase())
            );
            const selected = filteredAuthors.filter((a) => form.authorIds.includes(a.id));
            const unselected = filteredAuthors.filter((a) => !form.authorIds.includes(a.id));
            const visible = [...selected, ...unselected.slice(0, 50)];
            if (visible.length === 0) {
              return <p className="p-3 text-sm text-muted-foreground">{authorSearch ? "Ничего не найдено" : "Нет доступных авторов"}</p>;
            }
            return (
              <>
                {visible.map((author) => (
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
                ))}
                {unselected.length > 50 && (
                  <p className="p-2 text-xs text-center text-muted-foreground">
                    Показано 50 из {unselected.length}. Используйте поиск для уточнения.
                  </p>
                )}
              </>
            );
          })()}
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
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Найти жанр..."
            value={genreSearch}
            onChange={(e) => setGenreSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="border rounded-lg max-h-48 overflow-y-auto">
          {(() => {
            const filteredGenres = genres.filter((g) =>
              g.name.toLowerCase().includes(genreSearch.toLowerCase())
            );
            const selected = filteredGenres.filter((g) => form.genreIds.includes(g.id));
            const unselected = filteredGenres.filter((g) => !form.genreIds.includes(g.id));
            const visible = [...selected, ...unselected.slice(0, 50)];
            if (visible.length === 0) {
              return <p className="p-3 text-sm text-muted-foreground">{genreSearch ? "Ничего не найдено" : "Нет доступных жанров"}</p>;
            }
            return (
              <>
                {visible.map((genre) => (
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
                ))}
                {unselected.length > 50 && (
                  <p className="p-2 text-xs text-center text-muted-foreground">
                    Показано 50 из {unselected.length}. Используйте поиск для уточнения.
                  </p>
                )}
              </>
            );
          })()}
        </div>
      </section>

      {/* Keywords */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold">Ключевые слова</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={handleGenerateKeywords}
            disabled={generatingKeywords || !form.title.trim()}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {generatingKeywords ? "Генерация..." : "Сгенерировать ИИ"}
          </Button>
        </div>
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

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={saving || !form.title.trim() || !isDirty}>
          {saving ? "Сохранение..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
