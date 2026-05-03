export default function ManagerNewBookWireframe() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Боковая панель */}
      <aside className="w-64 border-r border-gray-300 bg-gray-50 p-4 hidden md:block">
        <div className="mb-6 px-3">
          <h2 className="text-lg font-semibold text-gray-800">Панель управления</h2>
          <p className="text-xs text-gray-500 mt-1">Управление магазином</p>
        </div>
        <nav className="flex flex-col gap-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-pointer">
            <span className="w-4 h-4 rounded-sm border border-gray-400 flex items-center justify-center text-[10px] text-gray-500">Ик</span> Обзор
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-gray-200 text-gray-800 cursor-pointer">
            <span className="w-4 h-4 rounded-sm border border-gray-400 bg-gray-300 flex items-center justify-center text-[10px] text-gray-600">Ик</span> Книги
          </div>
        </nav>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-6 flex flex-col h-screen overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Новая книга</h1>

        <form className="space-y-8 max-w-3xl">
          
          {/* Изображения */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Изображения</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Обложка</label>
              <button type="button" className="w-full flex items-center justify-center gap-2 h-10 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm">
                <span className="font-bold text-lg leading-none">+</span> Выбрать обложку
              </button>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-gray-800">Дополнительные изображения</label>
              <button type="button" className="w-full flex items-center justify-center gap-2 h-10 border border-gray-300 rounded bg-gray-50 text-gray-600 text-sm">
                <span className="font-bold text-lg leading-none">+</span> Добавить изображения
              </button>
            </div>
          </section>

          {/* Основная информация */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Основная информация</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Название *</label>
              <div className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-center">
                Война и мир
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-800">Описание</label>
                <button type="button" className="text-xs text-gray-600 bg-gray-100 border border-gray-300 px-2 py-1 rounded">
                  Сгенерировать ИИ
                </button>
              </div>
              <div className="flex h-24 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-start">
                Краткое описание книги...
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">Цена (р.) *</label>
                <div className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-center">
                  0.00
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">Кол-во на складе *</label>
                <div className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-center">
                  0
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-800">ISBN</label>
                <div className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-center">
                  978-3-16-148410-0
                </div>
              </div>
            </div>
          </section>

          {/* Издательство */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Издательство</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Издательство</label>
              <div className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 items-center justify-between">
                Не выбрано <span className="text-gray-400 text-xs">v</span>
              </div>
            </div>
          </section>

          {/* Авторы */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Авторы</h2>
            <div className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-center">
               Найти автора...
            </div>
            <div className="border border-gray-300 rounded bg-white max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm text-gray-800">Лев Толстой</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm text-gray-800">Федор Достоевский</span>
              </div>
            </div>
          </section>

          {/* Жанры */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Жанры</h2>
            <div className="flex h-10 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-center">
               Найти жанр...
            </div>
            <div className="border border-gray-300 rounded bg-white max-h-32 overflow-y-auto">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm text-gray-800">Роман</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span className="text-sm text-gray-800">Классика</span>
              </div>
            </div>
          </section>

          {/* Ключевые слова */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-lg font-semibold text-gray-800">Ключевые слова</h2>
              <button type="button" className="text-xs text-gray-600 bg-gray-100 border border-gray-300 px-2 py-1 rounded">
                Сгенерировать ИИ
              </button>
            </div>
            <p className="text-sm text-gray-500">Оставьте пустым для автоматической генерации.</p>
            <div className="flex gap-2">
              <div className="flex flex-1 h-10 rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-400 items-center">
                Введите ключевое слово
              </div>
              <button type="button" className="w-10 h-10 flex items-center justify-center bg-gray-200 border border-gray-300 rounded text-gray-600 font-bold text-lg">
                +
              </button>
            </div>
          </section>

          {/* Кнопки формы */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" className="h-10 px-4 bg-gray-300 text-gray-800 font-medium rounded text-sm">
              Создать книгу
            </button>
            <button type="button" className="h-10 px-4 bg-white border border-gray-300 text-gray-700 rounded text-sm">
              Отмена
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}