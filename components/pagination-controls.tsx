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
}

export function PaginationControls({ currentPage, totalPages, activeFilters }: PaginationControlsProps) {
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  const createPageUrl = (pageIndex: number) => {
    const params = new URLSearchParams();
    if (pageIndex > 0) params.set("page", pageIndex.toString());
    if (activeFilters.query) params.set("query", activeFilters.query);
    activeFilters.genres.forEach(g => params.append("genres", g));
    activeFilters.authors.forEach(a => params.append("authors", a));
    if (activeFilters.publisher) params.set("publisher", activeFilters.publisher);
    if (activeFilters.minPrice) params.set("minPrice", activeFilters.minPrice);
    if (activeFilters.maxPrice) params.set("maxPrice", activeFilters.maxPrice);
    if (activeFilters.inStock) params.set("inStock", "true");
    return `/?${params.toString()}`;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      {hasPrev ? (
        <Button variant="outline" size="icon" asChild>
          <Link href={createPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Предыдущая страница</span>
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <span className="text-sm font-medium">
        Страница {currentPage + 1} из {totalPages}
      </span>

      {hasNext ? (
        <Button variant="outline" size="icon" asChild>
          <Link href={createPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Следующая страница</span>
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
