import { BookCard, type Book } from "@/components/book-card";
import { PaginationControls } from "@/components/pagination-controls";
import { CatalogFilterSidebar } from "@/components/catalog-filter-sidebar";
import { CatalogSortSelect } from "@/components/catalog-sort-select";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Building } from "lucide-react";
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
}

async function getBooks(filters: ActiveFilters & { page: number; sort: string }): Promise<PaginatedBooks> {
  const url = new URL("http://localhost:8080/api/catalog/search");
  url.searchParams.append("page", filters.page.toString());
  url.searchParams.append("size", "12");
  if (filters.query) url.searchParams.append("query", filters.query);
  if (filters.minPrice) url.searchParams.append("minPrice", filters.minPrice);
  if (filters.maxPrice) url.searchParams.append("maxPrice", filters.maxPrice);
  filters.genres.forEach(g => url.searchParams.append("genres", g));
  filters.authors.forEach(a => url.searchParams.append("authors", a));
  if (filters.publisher) url.searchParams.append("publisher", filters.publisher);
  if (filters.inStock) url.searchParams.append("inStock", "true");
  if (filters.sort && filters.sort !== "newest") {
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

async function getPublisher(name: string): Promise<{ id: string; name: string; description?: string; logoUrl?: string } | null> {
  const res = await fetch("http://localhost:8080/api/catalog/publishers", { next: { revalidate: 300, tags: ["publishers"] } });
  if (!res.ok) return null;
  const publishers: { id: string; name: string; description?: string; logoUrl?: string }[] = await res.json();
  return publishers.find(p => p.name === name) ?? null;
}

export default async function PublisherCatalogPage(props: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const publisherName = decodeURIComponent(params.name);

  const publisher = await getPublisher(publisherName);
  if (!publisher) notFound();

  const pageParam = searchParams?.page;
  const page = typeof pageParam === "string" ? Math.max(0, parseInt(pageParam, 10)) : 0;

  const query = typeof searchParams?.query === "string" ? searchParams.query : "";
  const minPrice = typeof searchParams?.minPrice === "string" ? searchParams.minPrice : "";
  const maxPrice = typeof searchParams?.maxPrice === "string" ? searchParams.maxPrice : "";
  const inStock = searchParams?.inStock === "true";

  const genresParam = searchParams?.genres;
  const genres = Array.isArray(genresParam) ? genresParam : genresParam ? [genresParam] : [];

  const authorsParam = searchParams?.authors;
  const authors = Array.isArray(authorsParam) ? authorsParam : authorsParam ? [authorsParam] : [];

  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest";

  const activeFilters: ActiveFilters = {
    query,
    genres,
    authors,
    publisher: publisherName,
    minPrice,
    maxPrice,
    inStock,
  };

  const { content: books, totalPages, number: currentPage } = await getBooks({ ...activeFilters, page, sort });

  const currentParamsString = (() => {
    const p = new URLSearchParams();
    if (query) p.set("query", query);
    genres.forEach(g => p.append("genres", g));
    authors.forEach(a => p.append("authors", a));
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (inStock) p.set("inStock", "true");
    if (sort) p.set("sort", sort);
    return p.toString();
  })();

  return (
    <div className="flex flex-col flex-1 p-8">
      <main className="relative flex flex-col gap-8 w-full max-w-7xl mx-auto">
        <ManagerEditButton type="publisher" id={publisher.id} name={publisher.name} description={publisher.description} className="absolute top-0 right-0" />
        <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Каталог</Link>
          <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
          <span className="text-foreground font-medium">{publisher.name}</span>
        </nav>

        <div className="flex items-center gap-5">
          {publisher.logoUrl ? (
            <img
              src={publisher.logoUrl}
              alt={publisher.name}
              className="h-20 w-20 rounded-2xl object-contain border bg-background p-2"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border shrink-0">
              <Building className="h-9 w-9 text-primary" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-bold tracking-tight">{publisher.name}</h1>
            {publisher.description && (
              <p className="text-base text-muted-foreground max-w-2xl line-clamp-3">{publisher.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CatalogFilterSidebar activeFilters={activeFilters} currentSort={sort} basePath={`/publisher/${encodeURIComponent(publisherName)}`} lockedPublisher={publisherName} />
          <CatalogSortSelect currentSort={sort} currentParams={currentParamsString} basePath={`/publisher/${encodeURIComponent(publisherName)}`} />
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
            basePath={`/publisher/${encodeURIComponent(publisherName)}`}
            lockedPublisher={publisherName}
          />
        )}
      </main>
    </div>
  );
}
