import { BookCard, type Book } from "@/components/book-card";
import { PaginationControls } from "@/components/pagination-controls";

interface PaginatedBooks {
  content: Book[];
  totalPages: number;
  number: number;
}

// Функция для получения книг с бэкенда (Server Component)
async function getBooks(page: number, query: string): Promise<PaginatedBooks> {
  const url = new URL("http://localhost:8080/api/catalog/search");
  url.searchParams.append("page", page.toString());
  url.searchParams.append("size", "10");
  if (query) {
    url.searchParams.append("query", query);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 }, // Кэшируем ответ на 60 секунд
  });
  
  if (!res.ok) throw new Error("Failed to fetch");
  
  const data = await res.json();
  return {
    content: data.content || [],
    totalPages: data.totalPages || 1,
    number: data.number || 0,
  };
}

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Получаем параметры из URL (например: ?page=1). В Next.js 15+ это Promise.
  const searchParams = await props.searchParams;
  const pageParam = searchParams?.page;
  const page = typeof pageParam === 'string' ? Math.max(0, parseInt(pageParam, 10)) : 0;
  
  const queryParam = searchParams?.query;
  const query = typeof queryParam === 'string' ? queryParam : '';

  const { content: books, totalPages, number: currentPage } = await getBooks(page, query);

  return (
    <div className="flex flex-col flex-1 p-8">
      <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {query ? `Результаты поиска: "${query}"` : "Каталог книг"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {query ? "Найденные книги по вашему запросу." : "Откройте для себя лучшие новинки и классику литературы."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
        
        {books.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-lg">
            По вашему запросу ничего не найдено.
          </div>
        )}
        
        {totalPages > 1 && (
          <PaginationControls currentPage={currentPage} totalPages={totalPages} query={query} />
        )}
      </main>
    </div>
  );
}
