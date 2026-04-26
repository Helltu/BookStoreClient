"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

interface BookActionsProps {
  bookId: string;
  title: string;
  price: number;
  coverUrl?: string;
}

export function BookActions({ bookId, title, price, coverUrl }: BookActionsProps) {
  const { items, addItem, removeItem } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user?.role === "MANAGER") return null;

  const isInCart = items.some((item) => item.bookId === bookId);

  const handleAddToCart = () => {
    addItem({ bookId, title, price, coverUrl });
    toast.success(`Книга "${title}" добавлена в корзину!`);
  };

  const handleRemoveFromCart = () => {
    removeItem(bookId);
    toast.info(`Книга "${title}" удалена из корзины.`);
  };

  if (mounted && isInCart) {
    return (
        <Button onClick={handleRemoveFromCart} variant="secondary" size="lg" className="w-full sm:w-auto bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Check className="mr-2 h-5 w-5" />
          В корзине
        </Button>
    );
  }

  return (
      <Button onClick={handleAddToCart} size="lg" className="w-full sm:w-auto">
        <ShoppingCart className="mr-2 h-5 w-5" />
        В корзину
      </Button>
  );
}