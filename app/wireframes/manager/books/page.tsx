export default function ManagerBooksWireframe() {
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
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-pointer">
            <span className="w-4 h-4 rounded-sm border border-gray-400 flex items-center justify-center text-[10px] text-gray-500">Ик</span> Авторы
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-pointer">
            <span className="w-4 h-4 rounded-sm border border-gray-400 flex items-center justify-center text-[10px] text-gray-500">Ик</span> Жанры
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-pointer">
            <span className="w-4 h-4 rounded-sm border border-gray-400 flex items-center justify-center text-[10px] text-gray-500">Ик</span> Издательства
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 cursor-pointer">
            <span className="w-4 h-4 rounded-sm border border-gray-400 flex items-center justify-center text-[10px] text-gray-500">Ик</span> Заказы
          </div>
        </nav>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-6 flex flex-col h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Книги</h1>
          <div className="flex gap-2">
            <button className="flex items-center rounded-lg px-4 py-2 text-sm border border-gray-300 text-gray-700 bg-white">
              Импорт по ISBN
            </button>
            <button className="flex items-center rounded-lg px-4 py-2 text-sm bg-gray-200 border border-gray-300 text-gray-800 font-medium">
              + Добавить книгу
            </button>
          </div>
        </div>

        {/* Панель фильтров и поиска */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative">
            <input 
              placeholder="Поиск по ID, названию, ISBN..." 
              className="pl-3 pr-3 py-2 w-72 rounded-lg border border-gray-300 text-sm bg-white"
            />
          </div>

          <button className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700">
            Фильтры
          </button>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 bg-white" />
            Только в наличии
          </label>
        </div>

        {/* Таблица */}
        <div className="flex-1 rounded-lg border border-gray-300 overflow-auto bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-600 w-20">Обложка</th>
                <th className="px-4 py-3 font-medium text-gray-600">Название <span className="text-gray-400">v</span></th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Авторы</th>
                <th className="px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Жанры</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Цена <span className="text-gray-400">v</span></th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right">Склад <span className="text-gray-400">v</span></th>
                <th className="px-4 py-3 font-medium text-gray-400 w-48 hidden xl:table-cell">ID</th>
                <th className="px-4 py-3 font-medium text-gray-600 text-right w-32">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="w-10 h-14 bg-gray-200 rounded border border-gray-300 flex items-center justify-center text-[10px] text-gray-500">Фото</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-800">Название Книги {i + 1}</div>
                    <div className="text-xs text-gray-500 mt-0.5">ISBN: 978-5-0000-0000-{i}</div>
                  </td>
                  <td className="px-4 py-2 text-gray-600 hidden lg:table-cell">Автор {i + 1}</td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">Жанр</span>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-800 whitespace-nowrap">1 200.00 р.</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${i === 2 ? 'bg-gray-100 text-gray-500 border-gray-300' : 'bg-gray-200 text-gray-800 border-gray-300'}`}>
                      {i === 2 ? '0 шт.' : '15 шт.'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400 font-mono hidden xl:table-cell">
                    f47ac10b-58cc-4372-a567-0e02b2c3d47{i}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="w-7 h-7 rounded bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center text-xs" title="Изменить остаток">Ск</button>
                      <button className="w-7 h-7 rounded bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center text-xs" title="Редактировать">Рд</button>
                      <button className="w-7 h-7 rounded bg-gray-100 border border-gray-300 text-gray-600 flex items-center justify-center text-xs" title="Удалить">Уд</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
           <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded border border-gray-300 text-sm">{"<"}</button>
           <button className="px-3 py-1 bg-gray-300 text-gray-800 rounded font-medium text-sm">1</button>
           <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded border border-gray-300 text-sm">2</button>
           <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded border border-gray-300 text-sm">{">"}</button>
        </div>

      </main>
    </div>
  );
}