"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ServerCrash } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Caught in error boundary:", error);
  }, [error]);

  // Проверяем, связана ли ошибка с недоступностью сервера (fetch failed)
  const isNetworkError = 
    error.message.includes("fetch failed") || 
    error.message.includes("Failed to fetch") || 
    error.message.includes("ECONNREFUSED");

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-muted p-6 rounded-full mb-6">
        <ServerCrash className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-3">
        {isNetworkError ? "Сервер недоступен" : "Упс! Что-то пошло не так"}
      </h2>
      <p className="text-muted-foreground max-w-md mb-8 text-lg">
        {isNetworkError
          ? "Не удалось установить соединение с сервером. Пожалуйста, проверьте работает ли бэкенд и попробуйте позже."
          : "Произошла непредвиденная ошибка при обработке вашего запроса."}
      </p>
      <Button size="lg" onClick={() => reset()}>
        Попробовать снова
      </Button>
    </div>
  );
}