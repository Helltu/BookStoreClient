"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/useAuthStore";
import { genresApi, authorsApi, publishersApi } from "@/lib/api/manager";
import { revalidateGenre, revalidateAuthor, revalidatePublisher } from "@/app/actions";

// ── Book ─────────────────────────────────────────────────────────────────────

interface BookEditButtonProps {
  type: "book";
  id: string;
}

// ── Genre ────────────────────────────────────────────────────────────────────

interface GenreEditButtonProps {
  type: "genre";
  id: string;
  name: string;
}

// ── Author ───────────────────────────────────────────────────────────────────

interface AuthorEditButtonProps {
  type: "author";
  id: string;
  name: string;
  biography?: string;
}

// ── Publisher ─────────────────────────────────────────────────────────────────

interface PublisherEditButtonProps {
  type: "publisher";
  id: string;
  name: string;
  description?: string;
}

type Props = (BookEditButtonProps | GenreEditButtonProps | AuthorEditButtonProps | PublisherEditButtonProps) & { className?: string };

export function ManagerEditButton(props: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // genre
  const [genreName, setGenreName] = useState(props.type === "genre" ? props.name : "");

  // author
  const [authorName, setAuthorName] = useState(props.type === "author" ? props.name : "");
  const [authorBio, setAuthorBio] = useState(props.type === "author" ? (props.biography ?? "") : "");
  const [authorPhoto, setAuthorPhoto] = useState<File | null>(null);

  // publisher
  const [pubName, setPubName] = useState(props.type === "publisher" ? props.name : "");
  const [pubDesc, setPubDesc] = useState(props.type === "publisher" ? (props.description ?? "") : "");
  const [pubLogo, setPubLogo] = useState<File | null>(null);

  if (user?.role !== "MANAGER") return null;

  if (props.type === "book") {
    return (
      <Button variant="outline" size="sm" className={props.className} onClick={() => router.push(`/manager/books/${props.id}/edit`)}>
        <Pencil className="h-4 w-4 mr-2" />
        Редактировать
      </Button>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      if (props.type === "genre") {
        await genresApi.update(props.id, { name: genreName.trim() });
        await revalidateGenre(props.name, genreName.trim());
        toast.success("Жанр обновлён");
        if (genreName.trim() !== props.name) {
          router.replace(`/genre/${encodeURIComponent(genreName.trim())}`);
        } else {
          router.refresh();
        }
      } else if (props.type === "author") {
        await authorsApi.update(props.id, { name: authorName.trim(), biography: authorBio || undefined, photo: authorPhoto });
        await revalidateAuthor(props.name, authorName.trim());
        toast.success("Автор обновлён");
        if (authorName.trim() !== props.name) {
          router.replace(`/author/${encodeURIComponent(authorName.trim())}`);
        } else {
          router.refresh();
        }
      } else if (props.type === "publisher") {
        await publishersApi.update(props.id, { name: pubName.trim(), description: pubDesc || undefined, logo: pubLogo });
        await revalidatePublisher(props.name, pubName.trim());
        toast.success("Издательство обновлено");
        if (pubName.trim() !== props.name) {
          router.replace(`/publisher/${encodeURIComponent(pubName.trim())}`);
        } else {
          router.refresh();
        }
      }
      setOpen(false);
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" className={props.className} onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4 mr-2" />
        Редактировать
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {props.type === "genre" && "Редактировать жанр"}
              {props.type === "author" && "Редактировать автора"}
              {props.type === "publisher" && "Редактировать издательство"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {props.type === "genre" && (
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название</Label>
                <Input id="edit-name" value={genreName} onChange={(e) => setGenreName(e.target.value)} />
              </div>
            )}

            {props.type === "author" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Имя</Label>
                  <Input id="edit-name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bio">Биография</Label>
                  <Textarea id="edit-bio" value={authorBio} onChange={(e) => setAuthorBio(e.target.value)} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>Фото</Label>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <Button type="button" variant="outline" size="sm" className="max-w-[200px] overflow-hidden" asChild>
                      <span className="flex items-center gap-1"><Upload className="h-4 w-4 shrink-0" /><span className="truncate">{authorPhoto ? authorPhoto.name : "Выбрать файл"}</span></span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setAuthorPhoto(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </>
            )}

            {props.type === "publisher" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Название</Label>
                  <Input id="edit-name" value={pubName} onChange={(e) => setPubName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-desc">Описание</Label>
                  <Textarea id="edit-desc" value={pubDesc} onChange={(e) => setPubDesc(e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Логотип</Label>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <Button type="button" variant="outline" size="sm" className="max-w-[200px] overflow-hidden" asChild>
                      <span className="flex items-center gap-1"><Upload className="h-4 w-4 shrink-0" /><span className="truncate">{pubLogo ? pubLogo.name : "Выбрать файл"}</span></span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setPubLogo(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
