"use client";

import { useRouter } from "next/navigation";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  book: {
    id: string;
    title: string;
    price: number;
    coverUrl?: string;
  };
  variant?: "default" | "card";
  className?: string;
}

export function FavoriteButton({ book, variant = "default", className }: FavoriteButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { items, addItem, removeItem } = useFavoriteStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorite = items.some((item) => item.bookId === book.id);

  const toggleFavorite = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!isAuthenticated) {
      toast.error("Требуется авторизация", {
        description: "Пожалуйста, войдите в аккаунт."
      });
      router.push("/login");
      return;
    }

    if (isFavorite) {
      removeItem(book.id);
      toast.info(`Книга "${book.title}" удалена из избранного`);
    } else {
      addItem({ bookId: book.id, title: book.title, price: book.price, coverUrl: book.coverUrl });
      toast.success(`Книга "${book.title}" добавлена в избранное!`);
    }
  };

  // Рендерим заглушку до монтирования, чтобы избежать ошибок гидратации
  if (!mounted) {
    if (variant === "card") {
      return (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Heart className="h-4 w-4 text-foreground transition-colors" />
          <span className="sr-only">В избранное</span>
        </Button>
      );
    }

    return (
        <Button variant="outline" size="lg" className={cn("gap-2 shrink-0", className)}>
          <Heart size={18} />
        В избранное
      </Button>
    );
  }

  if (variant === "card") {
    return (
      <Button
        variant="secondary"
        size="icon"
        className={cn(
          "absolute right-2 top-2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm transition-opacity hover:bg-background sm:opacity-0 sm:group-hover:opacity-100",
          isFavorite && "opacity-100 sm:opacity-100",
          className
        )}
        onClick={toggleFavorite}
      >
        <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-foreground")} />
        <span className="sr-only">В избранное</span>
      </Button>
    );
  }

  return (
      <Button
          size="lg"
          variant={isFavorite ? "secondary" : "outline"}
          onClick={toggleFavorite}
          className={cn("gap-2 shrink-0 transition-all duration-300", isFavorite && "text-red-500 hover:text-red-600", className)}
      >
        <Heart className={cn(isFavorite ? "fill-current" : "")} size={18} />
        {isFavorite ? "В избранном" : "В избранное"}
      </Button>
  );
}