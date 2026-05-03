import { ChevronRight, Star, Heart } from "lucide-react";

export default function BookWireframe() {
  return (
    <div className="flex flex-col flex-1 p-4 sm:p-8 bg-background">
      <div className="relative w-full max-w-6xl mx-auto flex flex-col gap-6 sm:gap-10">

        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-2">
          <span className="bg-gray-200 text-gray-700 px-1 rounded">Главная</span>
          <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
          <span className="bg-gray-200 text-gray-700 px-1 rounded">Каталог</span>
          <ChevronRight className="h-4 w-4 mx-1 shrink-0" />
          <span className="bg-gray-200 text-gray-800 font-medium px-1 rounded">Название книги</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Image */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
               <span className="text-gray-500 text-lg font-medium">Обложка (Галерея)</span>
            </div>
            {/* Thumbnails placeholder */}
            <div className="flex gap-2 justify-center">
              <div className="h-16 w-12 bg-gray-300 rounded border border-gray-400" />
              <div className="h-16 w-12 bg-gray-200 rounded border border-gray-300" />
            </div>
          </div>

          {/* Right Column: Info */}
          <div className="md:col-span-7 lg:col-span-8 flex flex-col">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gray-200 text-gray-800 w-fit px-2 rounded">
                Полное Название Книги
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mt-2">
                <span className="bg-gray-100 text-gray-600 px-2 rounded">Имя Автора</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-gray-400 fill-gray-300" />
                  ))}
                </div>
                <span className="font-semibold text-sm ml-1 bg-gray-200 px-1 rounded text-gray-700">0.0</span>
              </div>
              <span className="text-sm text-muted-foreground bg-gray-100 px-1 rounded">0 отзывов</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-8">
               <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700">Жанр 1</span>
               <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700">Жанр 2</span>
            </div>

            {/* Buy Block */}
            <div className="py-6 border-y mb-8 flex flex-col gap-4">
              <span className="inline-flex w-fit items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 border border-gray-300">
                Осталось: 5 шт.
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight bg-gray-200 px-2 rounded text-gray-800">
                  1200.00
                </span>
                <span className="text-xl text-muted-foreground font-medium">р.</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="h-12 px-8 bg-primary text-primary-foreground font-medium rounded opacity-80 flex-1 sm:flex-none flex items-center justify-center">
                  В корзину
                </button>
                <button className="h-12 px-4 bg-gray-100 text-gray-700 border border-gray-300 font-medium rounded flex items-center justify-center gap-2">
                  <Heart className="h-5 w-5" />
                  В избранное
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">О книге</h3>
              <div className="text-muted-foreground leading-relaxed bg-gray-100 p-4 rounded text-gray-700">
                Текст описания книги. Текст описания книги. Текст описания книги. Текст описания книги.
                Текст описания книги. Текст описания книги. Текст описания книги.
              </div>
            </div>

            {/* Characteristics */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-5 text-gray-700">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                <div className="flex flex-col border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 mb-1">Издательство</span>
                  <span className="font-medium text-sm text-gray-800">Издательство</span>
                </div>
                <div className="flex flex-col border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 mb-1">Год издания</span>
                  <span className="font-medium text-sm text-gray-800">2024</span>
                </div>
                <div className="flex flex-col border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 mb-1">Кол-во страниц</span>
                  <span className="font-medium text-sm text-gray-800">320</span>
                </div>
                <div className="flex flex-col border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 mb-1">Язык</span>
                  <span className="font-medium text-sm text-gray-800">Русский</span>
                </div>
                <div className="flex flex-col border-b border-gray-200 pb-2 sm:col-span-2">
                  <span className="text-xs text-gray-500 mb-1">ISBN</span>
                  <span className="font-medium text-sm text-gray-800">978-5-0000-0000-0</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Отзывы</h2>
            <div className="h-32 w-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
               Блок отзывов
            </div>
        </div>
      </div>
    </div>
  );
}