"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

interface BookActionsProps {
  bookId: string;
  title: string;
  price: number;
  coverUrl?: string;
}

export function BookActions({ bookId, title, price, coverUrl }: BookActionsProps) {
  const { items, addItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isInCart = items.some((item) => item.bookId === bookId);

  const handleAddToCart = () => {
    addItem({ bookId, title, price, coverUrl });
    toast.success(`Книга "${title}" добавлена в корзину!`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
      <div className="text-3xl font-bold">{price.toFixed(2)} BYN</div>
      {mounted && isInCart ? (
        <Button asChild variant="secondary" size="lg" className="sm:ml-auto w-full sm:w-auto bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          <Link href="/cart">
            <Check className="mr-2 h-5 w-5" />
            В корзине
          </Link>
        </Button>
      ) : (
        <Button onClick={handleAddToCart} size="lg" className="sm:ml-auto w-full sm:w-auto">
          <ShoppingCart className="mr-2 h-5 w-5" />
          В корзину
        </Button>
      )}
    </div>
  );
}