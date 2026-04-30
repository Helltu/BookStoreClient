"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { BookItemCard } from "@/components/book-item-card";
import apiClient from "@/lib/api/axios";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, updateStockQuantity } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Ожидаем гидратацию Zustand, чтобы избежать расхождения HTML на сервере и клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    items.forEach((item) => {
      apiClient.get(`/catalog/books/${item.bookId}`).then((res) => {
        updateStockQuantity(item.bookId, res.data.stockQuantity ?? 0);
      }).catch(() => {});
    });
  }, [mounted]);

  if (!mounted) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="bg-muted p-6 rounded-full mb-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Ваша корзина пуста</h2>
        <p className="text-muted-foreground mb-6">Похоже, вы еще ничего не добавили.</p>
        <Button asChild size="lg">
          <Link href="/">Перейти к каталогу</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Корзина</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Список товаров */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {items.map((item) => (
            <BookItemCard
              key={item.bookId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
          
          <div className="flex justify-end mt-2">
            <Button variant="outline" className="text-muted-foreground" onClick={clearCart}>Очистить корзину</Button>
          </div>
        </div>

        {/* Итог */}
        <div className="lg:col-span-4">
          <div className="border rounded-xl bg-card p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Детали заказа</h2>
            
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товары ({totalItems})</span>
                <span>{totalPrice.toFixed(2)} р.</span>
              </div>
            </div>
            <Separator className="mb-4" />
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg">Итого</span>
              <span className="font-bold text-2xl">{totalPrice.toFixed(2)} р.</span>
            </div>
            
            <Button className="w-full text-lg h-12" asChild>
              <Link href={isAuthenticated ? "/checkout" : "/login?redirect=/cart"}>К оформлению заказа</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}