"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Minus, Plus, Trash2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BookItemCardData {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  coverUrl?: string;
  authors?: string[];
  averageRating?: number;
  totalReviews?: number;
  stockQuantity?: number;
}

interface Props {
  item: BookItemCardData;
  onUpdateQuantity?: (bookId: string, quantity: number) => void;
  onRemove?: (bookId: string) => void;
  onRemoveFromWishlist?: (bookId: string) => void;
}

export function BookItemCard({ item, onUpdateQuantity, onRemove, onRemoveFromWishlist }: Props) {
  const router = useRouter();

  return (
    <div
      className="relative flex gap-4 p-4 border rounded-xl bg-card shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/book/${item.bookId}`)}
    >
      {item.stockQuantity === 0 && (
        <span className="absolute top-3 right-3 inline-flex items-center rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive border border-destructive/30">Нет в наличии</span>
      )}
      {typeof item.stockQuantity === "number" && item.stockQuantity > 0 && item.stockQuantity <= 5 && (
        <span className="absolute top-3 right-3 inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 border border-amber-500/30">Осталось: {item.stockQuantity} шт.</span>
      )}

      <div className="shrink-0">
        {item.coverUrl ? (
          <img src={item.coverUrl} alt={item.title} className="h-24 w-20 object-cover rounded-md border" />
        ) : (
          <div className="h-24 w-20 bg-muted rounded-md border flex items-center justify-center text-[10px] text-muted-foreground text-center">Нет фото</div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div>
          <span className="font-semibold text-lg line-clamp-2 leading-snug">{item.title}</span>
          {item.authors && item.authors.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {item.authors.map((author, idx) => (
                <span key={idx}>
                  <Link
                    href={`/author/${encodeURIComponent(author)}`}
                    className="hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {author}
                  </Link>
                  {idx < item.authors!.length - 1 && ", "}
                </span>
              ))}
            </p>
          )}
          {typeof item.averageRating === "number" && (
            <div className="flex items-center gap-1 mt-1 text-sm">
              <Star className={`h-3.5 w-3.5 ${item.averageRating > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
              <span className="font-medium">{item.averageRating > 0 ? item.averageRating.toFixed(1) : "0.0"}</span>
              <span className="text-muted-foreground">({item.totalReviews ?? 0})</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-3 flex items-center justify-end gap-3">
          <div className="font-bold text-lg">{(item.price * item.quantity).toLocaleString("ru-RU")} р.</div>
          {onUpdateQuantity && (
            <div className="flex items-center border rounded-md" onClick={(e) => e.stopPropagation()}>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => onUpdateQuantity(item.bookId, item.quantity - 1)} disabled={item.quantity <= 1}>
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => onUpdateQuantity(item.bookId, Math.min(9, item.quantity + 1))} disabled={item.quantity >= 9}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
          {!onUpdateQuantity && item.quantity > 1 && (
            <span className="text-sm text-muted-foreground">× {item.quantity}</span>
          )}
          {onRemoveFromWishlist && (
            <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={(e) => { e.stopPropagation(); onRemoveFromWishlist(item.bookId); }}>
              <Heart className="h-4 w-4 fill-red-500" />
            </Button>
          )}
          {onRemove && (
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onRemove(item.bookId); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
