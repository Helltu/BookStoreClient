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
import { formatBookFormat, formatAgeRating } from "@/lib/utils";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface BookFilterSidebarFilters {
  genres: string[];
  authors: string[];
  publisher: string;
  minPrice: string;
  maxPrice: string;
  language: string;
  format: string;
  ageRating: string;
  minYear: string;
  maxYear: string;
  minRating: string;
  inStock: boolean;
  // catalog-only
  query?: string;
  // manager-only
  showDeleted?: boolean;
}

interface FilterData {
  genres: string[];
  authors: string[];
  publishers: string[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  formats: string[];
  ageRatings: string[];
  languages: { code: string; name: string }[];
}

type CatalogProps = {
  mode: "catalog";
  activeFilters: BookFilterSidebarFilters;
  currentSort?: string;
  basePath?: string;
  lockedGenre?: string;
  lockedAuthor?: string;
  lockedPublisher?: string;
};

type ManagerProps = {
  mode: "manager";
  filters: BookFilterSidebarFilters;
  onChange: (filters: BookFilterSidebarFilters) => void;
  showDeletedFilter?: boolean;
};

type BookFilterSidebarProps = CatalogProps | ManagerProps;

const EMPTY_FILTERS: BookFilterSidebarFilters = {
  genres: [], authors: [], publisher: "",
  minPrice: "", maxPrice: "",
  language: "", format: "", ageRating: "",
  minYear: "", maxYear: "", minRating: "",
  inStock: false, showDeleted: false,
};

export function BookFilterSidebar(props: BookFilterSidebarProps) {
  const router = useRouter();

  const filters = props.mode === "catalog" ? props.activeFilters : props.filters;

  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [minYear, setMinYear] = useState(filters.minYear);
  const [maxYear, setMaxYear] = useState(filters.maxYear);
  const [genreSearch, setGenreSearch] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [publisherSearch, setPublisherSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FilterData>({
    genres: [], authors: [], publishers: [],
    priceRange: { min: 0, max: 0 },
    yearRange: { min: 0, max: 0 },
    formats: [], ageRatings: [], languages: [],
  });

  useEffect(() => {
    Promise.all([
      apiClient.get<{ id: string; name: string }[]>("/catalog/genres"),
      apiClient.get<{ id: string; name: string }[]>("/catalog/authors"),
      apiClient.get<{ id: string; name: string }[]>("/catalog/publishers"),
      apiClient.get<{ min: number; max: number }>("/catalog/price-range"),
      apiClient.get<{ min: number; max: number }>("/catalog/year-range"),
      apiClient.get<string[]>("/catalog/formats"),
      apiClient.get<string[]>("/catalog/age-ratings"),
      apiClient.get<{ code: string; name: string }[]>("/catalog/languages/supported"),
    ])
      .then(([genresRes, authorsRes, publishersRes, priceRes, yearRes, formatsRes, ageRes, langRes]) => {
        setData({
          genres: genresRes.data.map(g => g.name),
          authors: authorsRes.data.map(a => a.name),
          publishers: publishersRes.data.map(p => p.name),
          priceRange: priceRes.data,
          yearRange: yearRes.data,
          formats: formatsRes.data,
          ageRatings: ageRes.data,
          languages: langRes.data,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { genres, authors, publishers, priceRange, yearRange, formats, ageRatings, languages } = data;

  // --- Catalog helpers ---
  function buildUrl(overrides: Partial<BookFilterSidebarFilters>): string {
    if (props.mode !== "catalog") return "/";
    const { activeFilters, currentSort, basePath = "/", lockedGenre, lockedAuthor, lockedPublisher } = props;
    const merged = { ...activeFilters, ...overrides };
    const params = new URLSearchParams();
    if (merged.query) params.set("query", merged.query);
    merged.genres.filter(g => g !== lockedGenre).forEach(g => params.append("genres", g));
    merged.authors.filter(a => a !== lockedAuthor).forEach(a => params.append("authors", a));
    const pub = lockedPublisher ? "" : merged.publisher;
    if (pub) params.set("publisher", pub);
    if (merged.minPrice) params.set("minPrice", merged.minPrice);
    if (merged.maxPrice) params.set("maxPrice", merged.maxPrice);
    if (merged.inStock) params.set("inStock", "true");
    if (merged.language) params.set("language", merged.language);
    if (merged.format) params.set("format", merged.format);
    if (merged.ageRating) params.set("ageRating", merged.ageRating);
    if (merged.minYear) params.set("minYear", merged.minYear);
    if (merged.maxYear) params.set("maxYear", merged.maxYear);
    if (merged.minRating) params.set("minRating", merged.minRating);
    if (currentSort) params.set("sort", currentSort);
    return `${basePath}?${params.toString()}`;
  }

  // --- Shared change dispatcher ---
  function update(overrides: Partial<BookFilterSidebarFilters>) {
    if (props.mode === "catalog") {
      router.push(buildUrl(overrides));
    } else {
      props.onChange({ ...filters, ...overrides });
    }
  }

  function applyPriceRange() { update({ minPrice, maxPrice }); }
  function applyYearRange() { update({ minYear, maxYear }); }

  function toggleGenre(genre: string) {
    const next = filters.genres.includes(genre)
      ? filters.genres.filter(g => g !== genre)
      : [...filters.genres, genre];
    update({ genres: next });
  }

  function toggleAuthor(author: string) {
    const next = filters.authors.includes(author)
      ? filters.authors.filter(a => a !== author)
      : [...filters.authors, author];
    update({ authors: next });
  }

  function resetFilters() {
    setMinPrice(""); setMaxPrice(""); setMinYear(""); setMaxYear("");
    if (props.mode === "catalog") {
      const { activeFilters, currentSort, basePath = "/" } = props;
      const params = new URLSearchParams();
      if (activeFilters.query) params.set("query", activeFilters.query);
      if (currentSort) params.set("sort", currentSort);
      router.push(`${basePath}?${params.toString()}`);
    } else {
      props.onChange(EMPTY_FILTERS);
    }
  }

  // --- Active count ---
  const lockedGenre = props.mode === "catalog" ? props.lockedGenre : undefined;
  const lockedAuthor = props.mode === "catalog" ? props.lockedAuthor : undefined;
  const lockedPublisher = props.mode === "catalog" ? props.lockedPublisher : undefined;

  const freeGenres = filters.genres.filter(g => g !== lockedGenre);
  const freeAuthors = filters.authors.filter(a => a !== lockedAuthor);
  const freePublisher = lockedPublisher ? "" : filters.publisher;

  const showDeletedFilter = props.mode === "manager" && props.showDeletedFilter;

  const activeCount =
    freeGenres.length +
    freeAuthors.length +
    (freePublisher ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.language ? 1 : 0) +
    (filters.format ? 1 : 0) +
    (filters.ageRating ? 1 : 0) +
    (filters.minYear || filters.maxYear ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.showDeleted ? 1 : 0);

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

      <SheetContent side={props.mode === "catalog" ? "left" : "right"} className="w-72 sm:max-w-72 flex flex-col p-0">
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

              {/* Show Deleted — manager only */}
              {showDeletedFilter && (
                <>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!filters.showDeleted}
                      onChange={(e) => update({ showDeleted: e.target.checked })}
                      className="h-4 w-4 rounded accent-primary shrink-0"
                    />
                    <span className="text-sm font-medium">Только удалённые</span>
                  </label>
                  <Separator />
                </>
              )}

              {/* In Stock */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => update({ inStock: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary shrink-0"
                />
                <span className="text-sm font-medium">Только в наличии</span>
              </label>

              {/* Genres */}
              {genres.length > 0 && !lockedGenre && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Жанры</h3>
                    <Input placeholder="Поиск жанра..." value={genreSearch} onChange={e => setGenreSearch(e.target.value)} className="h-8 text-sm" />
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {genres.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase())).map(genre => (
                        <label key={genre} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={filters.genres.includes(genre)} onChange={() => toggleGenre(genre)} className="h-4 w-4 rounded accent-primary shrink-0" />
                          <span className="text-sm">{genre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Authors */}
              {authors.length > 0 && !lockedAuthor && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Авторы</h3>
                    <Input placeholder="Поиск автора..." value={authorSearch} onChange={e => setAuthorSearch(e.target.value)} className="h-8 text-sm" />
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {authors.filter(a => a.toLowerCase().includes(authorSearch.toLowerCase())).map(author => (
                        <label key={author} className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={filters.authors.includes(author)} onChange={() => toggleAuthor(author)} className="h-4 w-4 rounded accent-primary shrink-0" />
                          <span className="text-sm">{author}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Publishers */}
              {publishers.length > 0 && !lockedPublisher && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Издательство</h3>
                    <Input placeholder="Поиск издательства..." value={publisherSearch} onChange={e => setPublisherSearch(e.target.value)} className="h-8 text-sm" />
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {publishers.filter(p => p.toLowerCase().includes(publisherSearch.toLowerCase())).map(pub => (
                        <label key={pub} className="flex items-center gap-2.5 cursor-pointer" onClick={() => update({ publisher: filters.publisher === pub ? "" : pub })}>
                          <input type="radio" name="book-filter-publisher" checked={filters.publisher === pub} onChange={() => {}} className="h-4 w-4 accent-primary shrink-0" />
                          <span className="text-sm">{pub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Language */}
              {languages.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Язык</h3>
                    <SearchableSelect
                      value={filters.language}
                      onChange={v => update({ language: v })}
                      options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
                      placeholder="Любой язык"
                    />
                  </div>
                </>
              )}

              {/* Format */}
              {formats.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Формат</h3>
                    <SearchableSelect
                      value={filters.format}
                      onChange={v => update({ format: v })}
                      options={formats.map(fmt => ({ value: fmt, label: formatBookFormat(fmt) }))}
                      placeholder="Любой формат"
                    />
                  </div>
                </>
              )}

              {/* Price */}
              <Separator />
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold">Цена (р.)</h3>
                <div className="flex items-center gap-2">
                  <Input type="number" min={0} placeholder={priceRange.min > 0 ? priceRange.min.toFixed(0) : "от"} value={minPrice} onChange={e => setMinPrice(e.target.value)} onBlur={applyPriceRange} onKeyDown={e => e.key === "Enter" && applyPriceRange()} className="h-8 text-sm" />
                  <span className="text-muted-foreground shrink-0 text-sm">—</span>
                  <Input type="number" min={0} placeholder={priceRange.max > 0 ? priceRange.max.toFixed(0) : "до"} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} onBlur={applyPriceRange} onKeyDown={e => e.key === "Enter" && applyPriceRange()} className="h-8 text-sm" />
                </div>
              </div>

              {/* Year */}
              {yearRange.max > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold">Год издания</h3>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={yearRange.min} max={yearRange.max} placeholder={yearRange.min.toString()} value={minYear} onChange={e => setMinYear(e.target.value)} onBlur={applyYearRange} onKeyDown={e => e.key === "Enter" && applyYearRange()} className="h-8 text-sm" />
                      <span className="text-muted-foreground shrink-0 text-sm">—</span>
                      <Input type="number" min={yearRange.min} max={yearRange.max} placeholder={yearRange.max.toString()} value={maxYear} onChange={e => setMaxYear(e.target.value)} onBlur={applyYearRange} onKeyDown={e => e.key === "Enter" && applyYearRange()} className="h-8 text-sm" />
                    </div>
                  </div>
                </>
              )}

              {/* Rating */}
              <Separator />
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Минимальный рейтинг</h3>
                <div className="flex gap-1.5 flex-wrap">
                  {["4.5", "4.0", "3.5", "3.0"].map(r => (
                    <button
                      key={r}
                      onClick={() => update({ minRating: filters.minRating === r ? "" : r })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${filters.minRating === r ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
                    >
                      ★ {r}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Rating */}
              {ageRatings.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Возрастной рейтинг</h3>
                    <div className="flex gap-1.5 flex-wrap">
                      {ageRatings.map(ar => (
                        <button
                          key={ar}
                          onClick={() => update({ ageRating: filters.ageRating === ar ? "" : ar })}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${filters.ageRating === ar ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
                        >
                          {formatAgeRating(ar)}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {activeCount > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button variant="destructive" size="sm" onClick={resetFilters} className="w-full gap-2">
              <X className="h-4 w-4" />
              Сбросить фильтры ({activeCount})
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
