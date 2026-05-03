export default function ManagerWireframe() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Обзор (Панель менеджера)</h1>

      {/* Catalog stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        {/* Карточка: Книги */}
        <div className="rounded-xl border border-gray-300 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 text-[10px]">Иконка</div>
            <span className="text-3xl font-bold text-gray-800">120</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Книги</p>
          <div className="mt-auto flex gap-2">
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Экспорт
            </button>
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Импорт
            </button>
          </div>
        </div>

        {/* Карточка: Авторы */}
        <div className="rounded-xl border border-gray-300 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 text-[10px]">Иконка</div>
            <span className="text-3xl font-bold text-gray-800">45</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Авторы</p>
          <div className="mt-auto flex gap-2">
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Экспорт
            </button>
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Импорт
            </button>
          </div>
        </div>

        {/* Карточка: Жанры */}
        <div className="rounded-xl border border-gray-300 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 text-[10px]">Иконка</div>
            <span className="text-3xl font-bold text-gray-800">15</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Жанры</p>
          <div className="mt-auto flex gap-2">
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Экспорт
            </button>
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Импорт
            </button>
          </div>
        </div>

        {/* Карточка: Издательства */}
        <div className="rounded-xl border border-gray-300 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 text-[10px]">Иконка</div>
            <span className="text-3xl font-bold text-gray-800">20</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Издательства</p>
          <div className="mt-auto flex gap-2">
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Экспорт
            </button>
            <button className="flex-1 flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Импорт
            </button>
          </div>
        </div>

        {/* Карточка: Заказы */}
        <div className="rounded-xl border border-gray-300 bg-white p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-gray-500 text-[10px]">Иконка</div>
            <span className="text-3xl font-bold text-gray-800">350</span>
          </div>
          <p className="text-sm font-medium text-gray-500">Заказы</p>
          <div className="mt-auto flex gap-2">
            <button className="w-full flex items-center justify-center rounded px-2 py-1.5 text-xs border border-gray-300 text-gray-600 bg-gray-50">
               Экспорт
            </button>
          </div>
        </div>

      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-800">Аналитика</h2>
          <div className="flex gap-1 flex-wrap">
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 bg-gray-50">7 дней</button>
            <button className="px-3 py-1.5 text-xs rounded border border-gray-400 bg-gray-200 text-gray-800 font-medium">30 дней</button>
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 bg-gray-50">90 дней</button>
            <button className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 bg-gray-50 flex items-center gap-1">
              Период <span className="text-gray-400 text-xs">v</span>
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Выручка</p>
            <p className="text-2xl font-bold text-gray-800">1 250 000 р.</p>
            <span className="text-xs font-medium text-gray-500">+12.5%</span>
          </div>
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Заказов</p>
            <p className="text-2xl font-bold text-gray-800">1 200</p>
            <span className="text-xs font-medium text-gray-500">+5.0%</span>
          </div>
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Продано книг</p>
            <p className="text-2xl font-bold text-gray-800">3 400</p>
            <span className="text-xs font-medium text-gray-500">-2.1%</span>
          </div>
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Средний чек</p>
            <p className="text-2xl font-bold text-gray-800">1 041 р.</p>
            <span className="text-xs text-gray-400">Доставка: 24 ч</span>
          </div>
        </div>

        {/* Row 2: Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-4 lg:col-span-3 min-h-[260px]">
            <h2 className="text-base font-semibold text-gray-800">Выручка по дням</h2>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
               [ Линейный график ]
            </div>
          </div>
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-4 lg:col-span-2 min-h-[260px]">
            <h2 className="text-base font-semibold text-gray-800">Статусы заказов</h2>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
               [ Круговая диаграмма ]
            </div>
          </div>
        </div>

        {/* Row 3: More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-4 lg:col-span-3 min-h-[260px]">
            <h2 className="text-base font-semibold text-gray-800">Продажи по жанрам</h2>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
               [ Столбчатая диаграмма ]
            </div>
          </div>
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-4 lg:col-span-2 min-h-[260px]">
            <h2 className="text-base font-semibold text-gray-800">Топ покупателей</h2>
            <div className="flex flex-col gap-2 h-full">
              <div className="h-8 bg-gray-50 border border-gray-300 rounded text-xs text-gray-400 flex items-center px-2">Поиск покупателя...</div>
              <div className="flex items-center gap-2 text-xs text-gray-500 px-1 mt-2">
                 <span className="flex-1">Покупатель</span>
                 <span className="w-10 text-center">Заказов</span>
                 <span className="w-24 text-right">Сумма</span>
              </div>
              <div className="flex flex-col mt-1">
                 <div className="flex items-center gap-2 text-sm p-1 border-b border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600">1</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Иван Иванов</p>
                      <p className="text-xs text-gray-500">@ivanov</p>
                    </div>
                    <span className="w-10 text-center font-semibold">12</span>
                    <span className="w-24 text-right font-semibold">12 000 р.</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm p-1 border-b border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600">2</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Петр Петров</p>
                      <p className="text-xs text-gray-500">@petrov</p>
                    </div>
                    <span className="w-10 text-center font-semibold">8</span>
                    <span className="w-24 text-right font-semibold">8 500 р.</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Top books, Slow movers, Returns, Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          
          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-3">
             <h2 className="text-base font-semibold text-gray-800">Топ книг</h2>
             <div className="h-8 bg-gray-50 border border-gray-300 rounded text-xs text-gray-400 flex items-center px-2">Поиск...</div>
             <div className="space-y-1 mt-2">
               <div className="flex items-center gap-2 px-1 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center shrink-0">1</span>
                  <p className="flex-1 text-sm text-gray-800 truncate">Популярная книга 1</p>
                  <span className="text-sm font-semibold text-gray-600 shrink-0">150</span>
               </div>
               <div className="flex items-center gap-2 px-1 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center shrink-0">2</span>
                  <p className="flex-1 text-sm text-gray-800 truncate">Популярная книга 2</p>
                  <span className="text-sm font-semibold text-gray-600 shrink-0">120</span>
               </div>
             </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-3">
             <h2 className="text-base font-semibold text-gray-800">Аутсайдеры</h2>
             <div className="h-8 bg-gray-50 border border-gray-300 rounded text-xs text-gray-400 flex items-center px-2">Поиск...</div>
             <div className="space-y-1 mt-2">
               <div className="flex items-center gap-2 px-1 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center shrink-0">1</span>
                  <p className="flex-1 text-sm text-gray-800 truncate">Непопулярная книга 1</p>
                  <span className="text-sm font-semibold text-gray-600 shrink-0">2</span>
               </div>
               <div className="flex items-center gap-2 px-1 py-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center shrink-0">2</span>
                  <p className="flex-1 text-sm text-gray-800 truncate">Непопулярная книга 2</p>
                  <span className="text-sm font-semibold text-gray-600 shrink-0">3</span>
               </div>
             </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-3">
             <h2 className="text-base font-semibold text-gray-800">Возвраты</h2>
             <div className="space-y-3 mt-2">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-[10px]">Иконка</div>
                 <div>
                   <p className="text-xl font-bold text-gray-800">12</p>
                   <p className="text-xs text-gray-500">Ожидают</p>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded border border-gray-300 bg-gray-50 flex items-center justify-center text-gray-500 text-[10px]">Иконка</div>
                 <div>
                   <p className="text-xl font-bold text-gray-800">45</p>
                   <p className="text-xs text-gray-500">Подтверждено</p>
                 </div>
               </div>
               <div className="pt-2 border-t border-gray-200">
                 <p className="text-xs text-gray-500">Сумма возвратов</p>
                 <p className="text-lg font-bold text-gray-800">45 000 р.</p>
               </div>
             </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-white p-5 flex flex-col gap-3">
             <h2 className="text-base font-semibold text-gray-800">Склад</h2>
             <div className="flex items-center gap-2 px-3 py-2 rounded border border-gray-300 bg-gray-50 text-gray-700 text-sm mt-2">
               <span className="font-bold">!</span> 5 без остатка
             </div>
             <div className="space-y-1.5 mt-2">
               <p className="text-xs text-gray-500">Заканчивается:</p>
               <div className="flex items-center gap-2 px-1 py-0.5">
                  <span className="w-6 text-center text-xs font-bold rounded px-1 bg-gray-200 text-gray-700">0</span>
                  <p className="flex-1 text-sm text-gray-800 truncate">Книга 1</p>
               </div>
               <div className="flex items-center gap-2 px-1 py-0.5">
                  <span className="w-6 text-center text-xs font-bold rounded px-1 bg-gray-200 text-gray-700">2</span>
                  <p className="flex-1 text-sm text-gray-800 truncate">Книга 2</p>
               </div>
               <div className="flex items-center gap-2 px-1 py-0.5">
                  <span className="w-6 text-center text-xs font-bold rounded px-1 bg-gray-200 text-gray-700">4</span>
                  <p className="flex-1 text-sm text-gray-800 truncate">Книга 3</p>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}