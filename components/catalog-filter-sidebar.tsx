"use client"

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";

interface ActiveFilters {
  query: string;
  genres: string[];
  authors: string[];
  publisher: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

interface CatalogFilterSidebarProps {
  activeFilters: ActiveFilters;
}

interface FilterData {
  genres: string[];
  authors: string[];
  publishers: string[];
  priceRange: { min: number; max: number };
}

export function CatalogFilterSidebar({ activeFilters }: CatalogFilterSidebarProps) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(activeFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(activeFilters.maxPrice);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FilterData>({
    genres: [],
    authors: [],
    publishers: [],
    priceRange: { min: 0, max: 0 },
  });

  useEffect(() => {
    Promise.all([
      apiClient.get<{ id: string; name: string }[]>("/catalog/genres"),
      apiClient.get<{ id: string; name: string }[]>("/catalog/authors"),
      apiClient.get<{ id: string; name: string }[]>("/catalog/publishers"),
      apiClient.get<{ min: number; max: number }>("/catalog/price-range"),
    ])
      .then(([genresRes, authorsRes, publishersRes, priceRes]) => {
        setData({
          genres: genresRes.data.map(g => g.name),
          authors: authorsRes.data.map(a => a.name),
          publishers: publishersRes.data.map(p => p.name),
          priceRange: priceRes.data,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { genres, authors, publishers, priceRange } = data;

  function buildUrl(overrides: Partial<ActiveFilters>): string {
    const merged = { ...activeFilters, ...overrides };
    const params = new URLSearchParams();
    if (merged.query) params.set("query", merged.query);
    merged.genres.forEach(g => params.append("genres", g));
    merged.authors.forEach(a => params.append("authors", a));
    if (merged.publisher) params.set("publisher", merged.publisher);
    if (merged.minPrice) params.set("minPrice", merged.minPrice);
    if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
    if (merged.inStock) params.set("inStock", "true");
    return `/?${params.toString()}`;
  }

  function toggleGenre(genre: string) {
    const next = activeFilters.genres.includes(genre)
      ? activeFilters.genres.filter(g => g !== genre)
      : [...activeFilters.genres, genre];
    router.push(buildUrl({ genres: next }));
  }

  function toggleAuthor(author: string) {
    const next = activeFilters.authors.includes(author)
      ? activeFilters.authors.filter(a => a !== author)
      : [...activeFilters.authors, author];
    router.push(buildUrl({ authors: next }));
  }

  function togglePublisher(pub: string) {
    router.push(buildUrl({ publisher: activeFilters.publisher === pub ? "" : pub }));
  }

  function applyPriceRange() {
    router.push(buildUrl({ minPrice, maxPrice }));
  }

  function resetFilters() {
    const params = new URLSearchParams();
    if (activeFilters.query) params.set("query", activeFilters.query);
    setMinPrice("");
    setMaxPrice("");
    router.push(`/?${params.toString()}`);
  }

  const hasActiveFilters =
    activeFilters.genres.length > 0 ||
    activeFilters.authors.length > 0 ||
    !!activeFilters.publisher ||
    !!activeFilters.minPrice ||
    !!activeFilters.maxPrice ||
    activeFilters.inStock;

  const activeCount =
    activeFilters.genres.length +
    activeFilters.authors.length +
    (activeFilters.publisher ? 1 : 0) +
    (activeFilters.minPrice || activeFilters.maxPrice ? 1 : 0) +
    (activeFilters.inStock ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 sm:max-w-72 flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex flex-col gap-5 px-5 py-5 pb-24">
              {/* In Stock */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeFilters.inStock}
                  onChange={() => router.push(buildUrl({ inStock: !activeFilters.inStock }))}
                  className="h-4 w-4 rounded accent-primary"
                />
                <span className="text-sm font-medium">Только в наличии</span>
              </label>

              <Separator />

              {/* Price Range */}
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Цена (BYN)</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder={priceRange.min > 0 ? priceRange.min.toFixed(0) : "от"}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="h-8 text-sm"
                  />
                  <span className="text-muted-foreground shrink-0 text-sm">—</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder={priceRange.max > 0 ? priceRange.max.toFixed(0) : "до"}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={applyPriceRange} className="h-8">
                  Применить
                </Button>
              </div>

              {genres.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Жанры</h3>
                    <div className="flex flex-col gap-1.5">
                      {genres.map(genre => (
                        <label key={genre} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeFilters.genres.includes(genre)}
                            onChange={() => toggleGenre(genre)}
                            className="h-4 w-4 rounded accent-primary shrink-0"
                          />
                          <span className="text-sm">{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {authors.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Авторы</h3>
                    <div className="flex flex-col gap-1.5">
                      {authors.map(author => (
                        <label key={author} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeFilters.authors.includes(author)}
                            onChange={() => toggleAuthor(author)}
                            className="h-4 w-4 rounded accent-primary shrink-0"
                          />
                          <span className="text-sm">{author}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {publishers.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Издательство</h3>
                    <div className="flex flex-col gap-1.5">
                      {publishers.map(pub => (
                        <label key={pub} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="publisher"
                            checked={activeFilters.publisher === pub}
                            onChange={() => togglePublisher(pub)}
                            className="h-4 w-4 accent-primary shrink-0"
                          />
                          <span className="text-sm">{pub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button
              variant="destructive"
              size="sm"
              onClick={resetFilters}
              className="w-full gap-2"
            >
              <X className="h-4 w-4" />
              Сбросить фильтры ({activeCount})
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
