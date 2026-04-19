"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookActionsProps {
  bookId: string;
  price: number;
}

export function BookActions({ bookId, price }: BookActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const toggleFavorite = () => setIsFavorite(!isFavorite);
  
  const addToCart = () => {
    // В будущем здесь будет логика добавления в корзину через API
    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2000); // Имитация успешного добавления
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6">
      <Button 
        size="lg" 
        className="flex-1 md:flex-none md:w-64"
        onClick={addToCart}
        variant={isAddedToCart ? "secondary" : "default"}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isAddedToCart ? "Добавлено в корзину" : `В корзину за ${price.toFixed(2)} BYN`}
      </Button>
      
      <Button 
        size="lg" 
        variant="outline" 
        className="flex-1 sm:flex-none"
        onClick={toggleFavorite}
      >
        <Heart 
          className={cn("mr-2 h-5 w-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "")} 
        />
        {isFavorite ? "В избранном" : "В избранное"}
      </Button>
    </div>
  );
}