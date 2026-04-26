"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, Tag, Building } from "lucide-react";
import Link from "next/link";
import { genresApi, authorsApi, publishersApi, booksApi } from "@/lib/api/manager";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`h-8 w-8 ${card.color}`} />
              <span className="text-3xl font-bold">
                {loading ? "—" : stats[card.key]}
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {card.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
