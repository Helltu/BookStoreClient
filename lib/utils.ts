import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatLanguage(code: string): string {
  try {
    return new Intl.DisplayNames(["ru"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const AGE_RATING_LABELS: Record<string, string> = {
  AGE_0_PLUS: "0+",
  AGE_6_PLUS: "6+",
  AGE_12_PLUS: "12+",
  AGE_16_PLUS: "16+",
  AGE_18_PLUS: "18+",
};

export function formatAgeRating(value: string): string {
  return AGE_RATING_LABELS[value] ?? value;
}

const FORMAT_LABELS: Record<string, string> = {
  HARDCOVER: "Твёрдая обложка",
  PAPERBACK: "Мягкая обложка",
  SOFTCOVER: "Мягкая обложка",
  POCKET: "Карманный",
  LARGE_FORMAT: "Большой формат",
  COLLECTOR: "Коллекционный",
};

export function formatBookFormat(value: string): string {
  return FORMAT_LABELS[value] ?? value;
}
