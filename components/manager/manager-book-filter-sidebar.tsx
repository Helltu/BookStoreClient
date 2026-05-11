"use client"

import { BookFilterSidebar, type BookFilterSidebarFilters } from "../book-filter-sidebar";

export type ManagerBookFilters = BookFilterSidebarFilters;

interface ManagerBookFilterSidebarProps {
  filters: ManagerBookFilters;
  onChange: (filters: ManagerBookFilters) => void;
  showDeletedFilter?: boolean;
}

export function ManagerBookFilterSidebar({ filters, onChange, showDeletedFilter }: ManagerBookFilterSidebarProps) {
  return (
    <BookFilterSidebar
      mode="manager"
      filters={filters}
      onChange={onChange}
      showDeletedFilter={showDeletedFilter}
    />
  );
}
