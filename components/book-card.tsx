"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { FavoriteButton } from "@/components/favorite-button";
import { toast } from "sonner";

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
  const router = useRouter();
  const { items: cartItems, addItem: addCartItem } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInCart = cartItems.some((item) => item.bookId === book.id);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast.error("Требуется авторизация", {
        description: "Пожалуйста, войдите в аккаунт или зарегистрируйтесь для этого действия."
      });
      // Укажите правильный путь на страницу входа
      router.push("/login");
      return;
    }
    action();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      addCartItem({ bookId: book.id, title: book.title, price: book.price, coverUrl: book.coverUrl });
      toast.success(`Книга "${book.title}" добавлена в корзину!`);
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <Link href={`/book/${book.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">Открыть {book.title}</span>
      </Link>
      
      <FavoriteButton book={book} variant="card" />

      {/* Обложка книги с фиксированной высотой */}
      <div className="h-72 w-full overflow-hidden bg-muted">
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
          {mounted && isInCart ? (
            <Button asChild variant="secondary" size="sm" className="relative z-20 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Link href="/cart">
                <Check className="mr-1.5 h-4 w-4" />
                В корзине
              </Link>
            </Button>
          ) : (
            <Button size="sm" className="relative z-20" onClick={handleAddToCart}>
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              В корзину
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}