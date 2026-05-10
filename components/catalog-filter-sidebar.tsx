"use client"

import { BookFilterSidebar, type BookFilterSidebarFilters } from "./book-filter-sidebar";

export type { BookFilterSidebarFilters as ActiveFilters };

interface CatalogFilterSidebarProps {
  activeFilters: BookFilterSidebarFilters;
  currentSort?: string;
  basePath?: string;
  lockedGenre?: string;
  lockedAuthor?: string;
  lockedPublisher?: string;
}

export function CatalogFilterSidebar({ activeFilters, currentSort, basePath, lockedGenre, lockedAuthor, lockedPublisher }: CatalogFilterSidebarProps) {
  return (
    <BookFilterSidebar
      mode="catalog"
      activeFilters={activeFilters}
      currentSort={currentSort}
      basePath={basePath}
      lockedGenre={lockedGenre}
      lockedAuthor={lockedAuthor}
      lockedPublisher={lockedPublisher}
    />
  );
}
