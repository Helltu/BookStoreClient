"use client"

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

interface ManagerBookFilters {
  genres: string[];
  authors: string[];
  publisher: string;
  minPrice: string;
  maxPrice: string;
}

interface ManagerBookFilterSidebarProps {
  filters: ManagerBookFilters;
  onChange: (filters: ManagerBookFilters) => void;
}

interface FilterData {
  genres: string[];
  authors: string[];
  publishers: string[];
  priceRange: { min: number; max: number };
}

export function ManagerBookFilterSidebar({ filters, onChange }: ManagerBookFilterSidebarProps) {
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [genreSearch, setGenreSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [publisherSearch, setPublisherSearch] = useState("");
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

  function toggleGenre(genre: string) {
    const next = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    onChange({ ...filters, genres: next });
  }

  function toggleAuthor(author: string) {
    const next = filters.authors.includes(author)
      ? filters.authors.filter(a => a !== author)
      : [...filters.authors, author];
    onChange({ ...filters, authors: next });
  }

  function togglePublisher(pub: string) {
    onChange({ ...filters, publisher: filters.publisher === pub ? "" : pub });
  }

  function applyPriceRange() {
    onChange({ ...filters, minPrice, maxPrice });
  }

  function resetFilters() {
    setMinPrice("");
    setMaxPrice("");
    onChange({ genres: [], authors: [], publisher: "", minPrice: "", maxPrice: "" });
  }

  const activeCount =
    filters.genres.length +
    filters.authors.length +
    (filters.publisher ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0);

  const hasActiveFilters = activeCount > 0;

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

      <SheetContent side="right" className="w-72 sm:max-w-72 flex flex-col p-0">
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
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Цена (р.)</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder={priceRange.min > 0 ? priceRange.min.toFixed(0) : "от"}
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    onBlur={applyPriceRange}
                    onKeyDown={e => e.key === "Enter" && applyPriceRange()}
                    className="h-8 text-sm"
                  />
                  <span className="text-muted-foreground shrink-0 text-sm">—</span>
                  <Input
                    type="number"
                    min={0}
                    placeholder={priceRange.max > 0 ? priceRange.max.toFixed(0) : "до"}
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    onBlur={applyPriceRange}
                    onKeyDown={e => e.key === "Enter" && applyPriceRange()}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {genres.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Жанры</h3>
                    <Input
                      placeholder="Поиск жанра..."
                      value={genreSearch}
                      onChange={e => setGenreSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {genres.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase())).map(genre => (
                        <label key={genre} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.genres.includes(genre)}
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
                    <Input
                      placeholder="Поиск автора..."
                      value={authorSearch}
                      onChange={e => setAuthorSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {authors.filter(a => a.toLowerCase().includes(authorSearch.toLowerCase())).map(author => (
                        <label key={author} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.authors.includes(author)}
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
                    <Input
                      placeholder="Поиск издательства..."
                      value={publisherSearch}
                      onChange={e => setPublisherSearch(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {publishers.filter(p => p.toLowerCase().includes(publisherSearch.toLowerCase())).map(pub => (
                        <label key={pub} className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="radio"
                            name="manager-publisher"
                            checked={filters.publisher === pub}
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
