"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookForm } from "@/components/manager/book-form";
import { booksApi } from "@/lib/api/manager";
import type { BookFormData } from "@/lib/types/manager";

export default function NewBookPage() {
  const router = useRouter();

  const handleSubmit = async (data: BookFormData) => {
    try {
      await booksApi.create(data);
      toast.success("Книга создана");
      router.push("/manager/books");
    } catch {
      // handled by interceptor
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Новая книга</h1>
      <BookForm onSubmit={handleSubmit} submitLabel="Создать книгу" />
    </div>
  );
}
