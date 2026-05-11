"use client"

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "relevance", label: "По релевантности" },
  { value: "price,asc", label: "Цена: по возрастанию" },
  { value: "price,desc", label: "Цена: по убыванию" },
  { value: "averageRating,desc", label: "Рейтинг: по убыванию" },
  { value: "createdAt,desc", label: "Новинки" },
  { value: "title,asc", label: "Название: А–Я" },
];

interface CatalogSortSelectProps {
  currentSort: string;
  currentParams: string;
  basePath?: string;
}

export function CatalogSortSelect({ currentSort, currentParams, basePath = "/" }: CatalogSortSelectProps) {
  const router = useRouter();

  function handleChange(value: string) {
    const params = new URLSearchParams(currentParams);
    params.set("sort", value);
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Select value={currentSort || "relevance"} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-52 text-sm">
        <SelectValue placeholder="Сортировка" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
