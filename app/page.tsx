import { BookCard, type Book } from "@/components/book-card";
import { PaginationControls } from "@/components/pagination-controls";
import { CatalogFilterSidebar } from "@/components/catalog-filter-sidebar";
import { CatalogSortSelect } from "@/components/catalog-sort-select";

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


export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const pageParam = searchParams?.page;
  const page = typeof pageParam === "string" ? Math.max(0, parseInt(pageParam, 10)) : 0;

  const query = typeof searchParams?.query === "string" ? searchParams.query : "";
  const minPrice = typeof searchParams?.minPrice === "string" ? searchParams.minPrice : "";
  const maxPrice = typeof searchParams?.maxPrice === "string" ? searchParams.maxPrice : "";
  const publisher = typeof searchParams?.publisher === "string" ? searchParams.publisher : "";
  const inStock = searchParams?.inStock === "true";

  const genresParam = searchParams?.genres;
  const genres = Array.isArray(genresParam) ? genresParam : genresParam ? [genresParam] : [];

  const authorsParam = searchParams?.authors;
  const authors = Array.isArray(authorsParam) ? authorsParam : authorsParam ? [authorsParam] : [];

  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest";

  const activeFilters: ActiveFilters = { query, genres, authors, publisher, minPrice, maxPrice, inStock };

  const { content: books, totalPages, number: currentPage } = await getBooks({ ...activeFilters, page, sort });

  const currentParamsString = (() => {
    const p = new URLSearchParams();
    if (query) p.set("query", query);
    genres.forEach(g => p.append("genres", g));
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
      <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {query ? `Результаты поиска: "${query}"` : "Каталог книг"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {query
              ? "Найденные книги по вашему запросу."
              : "Откройте для себя лучшие новинки и классику литературы."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CatalogFilterSidebar activeFilters={activeFilters} currentSort={sort} />
          <CatalogSortSelect currentSort={sort} currentParams={currentParamsString} />
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
          />
        )}
      </main>
    </div>
  );
}
