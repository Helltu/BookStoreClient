"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ManagerPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  tableRef?: RefObject<HTMLDivElement | null>;
}

export function ManagerPagination({ page, totalPages, onPageChange, tableRef }: ManagerPaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | "...")[] = [0];
    if (page > 3) pages.push("...");
    const start = Math.max(1, page - 1);
    const end = Math.min(totalPages - 2, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 4) pages.push("...");
    pages.push(totalPages - 1);
    return pages;
  };

  const handlePageChange = (p: number) => {
    onPageChange(p);
    if (tableRef?.current) tableRef.current.scrollTop = 0;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button variant="outline" size="icon" disabled={page === 0} onClick={() => handlePageChange(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} className="px-2 text-muted-foreground select-none">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => p !== page && handlePageChange(p)}
          >
            {p + 1}
          </Button>
        )
      )}

      <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => handlePageChange(page + 1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
