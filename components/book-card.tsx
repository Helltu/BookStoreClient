"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Book {
  id: string;
  title: string;
  description: string;
  price: number;
  authors: string[];
  coverUrl?: string;
  averageRating?: number;
  totalReviews?: number;
}

export function BookCard({ book }: { book: Book }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход на страницу книги
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <Link href={`/book/${book.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">Открыть {book.title}</span>
      </Link>
      
      {/* Кнопка "В избранное" */}
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute right-2 top-2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100",
          isFavorite && "opacity-100 sm:opacity-100"
        )}
        onClick={toggleFavorite}
      >
        <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-foreground")} />
        <span className="sr-only">В избранное</span>
      </Button>

      {/* Обложка книги с пропорцией 2:3 */}
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-sm">
            <span>Нет обложки</span>
          </div>
        )}
      </div>
      
      {/* Информация о книге */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold leading-tight tracking-tight line-clamp-1">{book.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
          {book.authors?.join(", ") || "Неизвестный автор"}
        </p>
        
        {/* Рейтинг и отзывы */}
        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <Star className={`h-4 w-4 ${book.averageRating && book.averageRating > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
          <span className="font-medium">
            {book.averageRating && book.averageRating > 0 ? book.averageRating.toFixed(1) : "0.0"}
          </span>
          <span className="text-muted-foreground">({book.totalReviews || 0})</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-bold">{book.price ? `${book.price.toFixed(2)} BYN` : "Бесплатно"}</span>
          <Button size="sm" className="relative z-20" onClick={(e) => e.preventDefault()}>
            В корзину
          </Button>
        </div>
      </div>
    </div>
  );
}