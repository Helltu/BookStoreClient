"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Users, Tag, Building, Download, Upload } from "lucide-react";
import Link from "next/link";
import { genresApi, authorsApi, publishersApi, booksApi, importExportApi, type CatalogEntity } from "@/lib/api/manager";

interface Stats {
  books: number;
  authors: number;
  genres: number;
  publishers: number;
}


const cards = [
  { key: "books" as const, label: "Книги", icon: BookOpen, href: "/manager/books", color: "text-blue-500" },
  { key: "authors" as const, label: "Авторы", icon: Users, href: "/manager/authors", color: "text-green-500" },
  { key: "genres" as const, label: "Жанры", icon: Tag, href: "/manager/genres", color: "text-purple-500" },
  { key: "publishers" as const, label: "Издательства", icon: Building, href: "/manager/publishers", color: "text-orange-500" },
];

export default function ManagerDashboard() {
  const [stats, setStats] = useState<Stats>({ books: 0, authors: 0, genres: 0, publishers: 0 });
  const [loading, setLoading] = useState(true);
  const [ioLoading, setIoLoading] = useState<CatalogEntity | null>(null);
  const [ioMessage, setIoMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const fileInputRefs = useRef<Record<CatalogEntity, HTMLInputElement | null>>({
    genres: null, authors: null, publishers: null, books: null,
  });

  async function handleExport(entity: CatalogEntity) {
    setIoLoading(entity);
    setIoMessage(null);
    try {
      const res = await importExportApi.export(entity);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entity}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setIoMessage({ text: `Ошибка экспорта ${entity}`, ok: false });
    } finally {
      setIoLoading(null);
    }
  }

  async function handleImport(entity: CatalogEntity, file: File) {
    setIoLoading(entity);
    setIoMessage(null);
    try {
      await importExportApi.import(entity, file);
      setIoMessage({ text: `Импорт ${entity} завершён`, ok: true });
      const [booksRes, authorsRes, genresRes, publishersRes] = await Promise.all([
        booksApi.getAll(0, 1),
        authorsApi.getAll(),
        genresApi.getAll(),
        publishersApi.getAll(),
      ]);
      setStats({
        books: booksRes.data.totalElements,
        authors: authorsRes.data.length,
        genres: genresRes.data.length,
        publishers: publishersRes.data.length,
      });
    } catch {
      setIoMessage({ text: `Ошибка импорта ${entity}`, ok: false });
    } finally {
      setIoLoading(null);
    }
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const [booksRes, authorsRes, genresRes, publishersRes] = await Promise.all([
          booksApi.getAll(0, 1),
          authorsApi.getAll(),
          genresApi.getAll(),
          publishersApi.getAll(),
        ]);
        setStats({
          books: booksRes.data.totalElements,
          authors: authorsRes.data.length,
          genres: genresRes.data.length,
          publishers: publishersRes.data.length,
        });
      } catch {
        // errors handled by axios interceptor
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Обзор</h1>
      {ioMessage && (
        <div className={`mb-4 text-sm px-3 py-2 rounded-lg border ${ioMessage.ok ? "border-green-500 text-green-700 bg-green-50" : "border-red-500 text-red-700 bg-red-50"}`}>
          {ioMessage.text}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const ioKey = card.key as CatalogEntity;
          return (
            <div key={card.key} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col">
              <Link href={card.href} className="group flex items-center justify-between mb-4">
                <card.icon className={`h-8 w-8 ${card.color}`} />
                <span className="text-3xl font-bold">
                  {loading ? "—" : stats[card.key]}
                </span>
              </Link>
              <p className="text-sm font-medium text-muted-foreground mb-4">{card.label}</p>
              <div className="mt-auto flex gap-2">
                <button
                  disabled={ioLoading === ioKey}
                  onClick={() => handleExport(ioKey)}
                  title="Экспорт"
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Экспорт
                </button>
                <button
                  disabled={ioLoading === ioKey}
                  onClick={() => fileInputRefs.current[ioKey]?.click()}
                  title="Импорт"
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs border hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Импорт
                </button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  ref={(el) => { fileInputRefs.current[ioKey] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(ioKey, file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
