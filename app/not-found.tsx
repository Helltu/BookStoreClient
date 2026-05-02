import Link from 'next/link';
import { BookX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center px-4">
      <BookX className="h-16 w-16 text-muted-foreground/40" />
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-xl font-semibold">Страница не найдена</p>
        <p className="text-muted-foreground max-w-sm">
          Запрашиваемая страница не существует или была удалена.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        На главную
      </Link>
    </div>
  );
}
