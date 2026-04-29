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
  stockQuantity?: number;
}

export function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const { items: cartItems, addItem: addCartItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const isManager = user?.role === "MANAGER";

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
      
      {!isManager && <FavoriteButton book={book} variant="card" />}

      {/* Обложка книги с фиксированной высотой */}
      <div className="relative h-72 w-full overflow-hidden bg-muted">
        {/* Бейдж наличия */}
        {book.stockQuantity === 0 && (
          <span className="absolute top-2 left-2 z-20 inline-flex items-center rounded-md bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive border border-destructive/30">
            Нет в наличии
          </span>
        )}
        {typeof book.stockQuantity === "number" && book.stockQuantity > 0 && book.stockQuantity <= 5 && (
          <span className="absolute top-2 left-2 z-20 inline-flex items-center rounded-md bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 border border-amber-500/30">
            Осталось: {book.stockQuantity} шт.
          </span>
        )}
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
          {book.authors && book.authors.length > 0
            ? book.authors.map((author, idx) => (
                <span key={idx}>
                  <Link
                    href={`/author/${encodeURIComponent(author)}`}
                    className="relative z-20 hover:text-foreground transition-colors"
                    onClick={e => e.stopPropagation()}
                  >
                    {author}
                  </Link>
                  {idx < book.authors.length - 1 && ", "}
                </span>
              ))
            : "Неизвестный автор"}
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
          <span className="text-lg font-bold">{book.price ? `${book.price.toFixed(2)} р.` : "Бесплатно"}</span>
          {!isManager && (
            mounted && isInCart ? (
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
            )
          )}
        </div>
      </div>
    </div>
  );
}