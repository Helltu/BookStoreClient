import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";

export default function HomeWireframe() {
  return (
    <div className="flex flex-col flex-1 p-8">
      <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gray-200 text-gray-800 w-fit px-2 rounded">Каталог книг</h1>
          <p className="text-lg text-muted-foreground bg-gray-200 text-gray-600 w-fit px-2 rounded mt-1">
            Откройте для себя лучшие новинки и классику литературы.
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 h-10 px-4 bg-gray-200 text-gray-700 rounded border border-gray-300">
            <Filter className="h-4 w-4" />
            <span>Фильтры</span>
          </button>
          
          <div className="h-10 px-4 bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center justify-between min-w-[200px]">
            <span>Сортировка: Сначала новые</span>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </div>
        </div>

        {/* Grid of Books */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              {/* Book Cover */}
              <div className="w-full aspect-[2/3] bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 font-medium">Обложка книги</span>
              </div>
              
              <div className="flex flex-col mt-2">
                <span className="text-lg font-semibold bg-gray-200 text-gray-800 px-1 rounded w-fit">Название книги</span>
                <span className="text-sm text-gray-500 bg-gray-100 text-gray-600 px-1 rounded w-fit mt-1">Автор книги</span>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4">
                <span className="text-xl font-bold bg-gray-200 text-gray-800 px-1 rounded">1200 р.</span>
                <button className="h-10 px-4 bg-primary text-primary-foreground font-medium rounded opacity-80">
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Placeholder */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-600 border border-gray-300 font-medium">{"<"}</button>
          <button className="h-10 w-10 bg-primary rounded flex items-center justify-center text-primary-foreground font-medium">1</button>
          <button className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-700 border border-gray-300 font-medium">2</button>
          <button className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-700 border border-gray-300 font-medium">3</button>
          <button className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-600 border border-gray-300 font-medium">{">"}</button>
        </div>
      </main>
    </div>
  );
}