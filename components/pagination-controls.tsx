import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ActiveFilters {
  query: string;
  genres: string[];
  authors: string[];
  publisher: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  activeFilters: ActiveFilters;
  basePath?: string;
  lockedGenre?: string;
  lockedAuthor?: string;
  lockedPublisher?: string;
}

export function PaginationControls({ currentPage, totalPages, activeFilters, basePath = "/", lockedGenre, lockedAuthor, lockedPublisher }: PaginationControlsProps) {
  const createPageUrl = (pageIndex: number) => {
    const params = new URLSearchParams();
    if (pageIndex > 0) params.set("page", pageIndex.toString());
    if (activeFilters.query) params.set("query", activeFilters.query);
    activeFilters.genres.filter(g => g !== lockedGenre).forEach(g => params.append("genres", g));
    activeFilters.authors.filter(a => a !== lockedAuthor).forEach(a => params.append("authors", a));
    if (!lockedPublisher && activeFilters.publisher) params.set("publisher", activeFilters.publisher);
    if (activeFilters.minPrice) params.set("minPrice", activeFilters.minPrice);
    if (activeFilters.maxPrice) params.set("maxPrice", activeFilters.maxPrice);
    if (activeFilters.inStock) params.set("inStock", "true");
    return `${basePath}?${params.toString()}`;
  };

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);

    const pages: (number | "...")[] = [0];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages - 2, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 4) pages.push("...");

    pages.push(totalPages - 1);
    return pages;
  };

  const pages = getPages();

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <Button variant="outline" size="icon" asChild disabled={currentPage === 0}>
        <Link href={currentPage > 0 ? createPageUrl(currentPage - 1) : "#"}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Предыдущая страница</span>
        </Link>
      </Button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground select-none">…</span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            asChild={page !== currentPage}
          >
            {page !== currentPage ? (
              <Link href={createPageUrl(page)}>{page + 1}</Link>
            ) : (
              <span>{page + 1}</span>
            )}
          </Button>
        )
      )}

      <Button variant="outline" size="icon" asChild disabled={currentPage === totalPages - 1}>
        <Link href={currentPage < totalPages - 1 ? createPageUrl(currentPage + 1) : "#"}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Следующая страница</span>
        </Link>
      </Button>
    </div>
  );
}
