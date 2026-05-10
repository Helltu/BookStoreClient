"use client"

import { BookFilterSidebar, type BookFilterSidebarFilters } from "../book-filter-sidebar";

export type ManagerBookFilters = BookFilterSidebarFilters;

interface ManagerBookFilterSidebarProps {
  filters: ManagerBookFilters;
  onChange: (filters: ManagerBookFilters) => void;
}

export function ManagerBookFilterSidebar({ filters, onChange }: ManagerBookFilterSidebarProps) {
  return (
    <BookFilterSidebar
      mode="manager"
      filters={filters}
      onChange={onChange}
    />
  );
}
