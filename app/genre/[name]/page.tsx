import { BookCard, type Book } from "@/components/book-card";
import { PaginationControls } from "@/components/pagination-controls";
import { CatalogFilterSidebar } from "@/components/catalog-filter-sidebar";
import { CatalogSortSelect } from "@/components/catalog-sort-select";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Tag } from "lucide-react";
import { ManagerEditButton } from "@/components/manager-edit-button";

interface PaginatedBooks {
  content: Book[];
  totalPages: number;
  number: number;
}

interface ActiveFilters {
  query: string;
  genres: string[];
  authors: string[];
  publisher: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  language: string;
  format: string;
  ageRating: string;
  minYear: string;
  maxYear: string;
  minRating: string;
}

async function getBooks(filters: ActiveFilters & { page: number; sort: string }): Promise<PaginatedBooks> {
  const url = new URL(`${process.env.BACKEND_URL ?? "http://localhost:8080"}/api/catalog/search`);
  url.searchParams.append("page", filters.page.toString());
  url.searchParams.append("size", "12");
  if (filters.query) url.searchParams.append("query", filters.query);
  if (filters.minPrice) url.searchParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) url.searchParams.append("maxPrice", filters.maxPrice);
  filters.genres.forEach(g => url.searchParams.append("genres", g));
  filters.authors.forEach(a => url.searchParams.append("authors", a));
  if (filters.publisher) url.searchParams.append("publisher", filters.publisher);
  if (filters.inStock) url.searchParams.append("inStock", "true");
  if (filters.language) url.searchParams.append("language", filters.language);
  if (filters.format) url.searchParams.append("format", filters.format);
  if (filters.ageRating) url.searchParams.append("ageRating", filters.ageRating);
  if (filters.minYear) url.searchParams.append("minYear", filters.minYear);
  if (filters.maxYear) url.searchParams.append("maxYear", filters.maxYear);
  if (filters.minRating) url.searchParams.append("minRating", filters.minRating);
  if (filters.sort) {
    filters.sort.split(";").forEach(s => url.searchParams.append("sort", s));
  }

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch books");

  const data = await res.json();
  return {
    content: data.content || [],
    totalPages: data.totalPages || 1,
    number: data.number || 0,
  };
}

async function getGenre(name: string): Promise<{ id: string; name: string } | null> {
  const res = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:8080"}/api/catalog/genres`, { next: { revalidate: 300, tags: ["genres"] } });
  if (!res.ok) return null;
  const genres: { id: string; name: string }[] = await res.json();
  return genres.find(g => g.name === name) ?? null;
}

export default async function GenreCatalogPage(props: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const genreName = decodeURIComponent(params.name);

  const genre = await getGenre(genreName);
  if (!genre) notFound();

  const pageParam = searchParams?.page;
  const page = typeof pageParam === "string" ? Math.max(0, parseInt(pageParam, 10)) : 0;

  const query = typeof searchParams?.query === "string" ? searchParams.query : "";
  const minPrice = typeof searchParams?.minPrice === "string" ? searchParams.minPrice : "";
  const maxPrice = typeof searchParams?.maxPrice === "string" ? searchParams.maxPrice : "";
  const publisher = typeof searchParams?.publisher === "string" ? searchParams.publisher : "";
  const inStock = searchParams?.inStock === "true";

  const authorsParam = searchParams?.authors;
  const authors = Array.isArray(authorsParam) ? authorsParam : authorsParam ? [authorsParam] : [];

  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "createdAt,desc";
  const language = typeof searchParams?.language === "string" ? searchParams.language : "";
  const format = typeof searchParams?.format === "string" ? searchParams.format : "";
  const ageRating = typeof searchParams?.ageRating === "string" ? searchParams.ageRating : "";
  const minYear = typeof searchParams?.minYear === "string" ? searchParams.minYear : "";
  const maxYear = typeof searchParams?.maxYear === "string" ? searchParams.maxYear : "";
  const minRating = typeof searchParams?.minRating === "string" ? searchParams.minRating : "";

  const activeFilters: ActiveFilters = {
    query,
    genres: [genreName],
    authors,
    publisher,
    minPrice,
    maxPrice,
    inStock,
    language,
    format,
    ageRating,
    minYear,
    maxYear,
    minRating,
  };

  const { content: books, totalPages, number: currentPage } = await getBooks({ ...activeFilters, page, sort });

  const currentParamsString = (() => {
    const p = new URLSearchParams();
    if (query) p.set("query", query);
    authors.forEach(a => p.append("authors", a));
    if (publisher) p.set("publisher", publisher);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (inStock) p.set("inStock", "true");
    if (sort) p.set("sort", sort);
    return p.toString();
  })();

  return (
    <div className="flex flex-col flex-1 p-8">
      <main className="relative flex flex-col gap-8 w-full max-w-7xl mx-auto">
        <ManagerEditButton type="genre" id={genre.id} name={genre.name} className="absolute top-0 right-0" />
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Каталог</Link>
          <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
          <span className="text-foreground font-medium">{genre.name}</span>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Tag className="h-7 w-7 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight">{genre.name}</h1>
            <p className="text-lg text-muted-foreground">Все книги жанра</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CatalogFilterSidebar activeFilters={activeFilters} currentSort={sort} basePath={`/genre/${encodeURIComponent(genreName)}`} lockedGenre={genreName} />
          <CatalogSortSelect currentSort={sort} currentParams={currentParamsString} basePath={`/genre/${encodeURIComponent(genreName)}`} />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        {books.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-lg">
            По вашему запросу ничего не найдено.
          </div>
        )}

        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            activeFilters={activeFilters}
            basePath={`/genre/${encodeURIComponent(genreName)}`}
            lockedGenre={genreName}
          />
        )}
      </main>
    </div>
  );
}
