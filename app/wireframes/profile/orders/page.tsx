import Link from "next/link";

export default function ProfileOrdersWireframe() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8">
        <Link href="/wireframes/profile/wishlist" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Избранное</Link>
        <Link href="/wireframes/profile/info" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Личные данные</Link>
        <Link href="/wireframes/profile/password" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Пароль</Link>
        <Link href="/wireframes/profile/addresses" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Адреса</Link>
        <Link href="/wireframes/profile/orders" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded opacity-80">Мои заказы</Link>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Раскрытый заказ */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          {/* Шапка заказа */}
          <div className="w-full flex flex-wrap items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">ORD-123456</span>
              {/* Упрощенный бейдж статуса "Новый" */}
              <span className="text-xs px-2 py-1 font-medium bg-gray-200 text-gray-700 rounded border border-gray-300">
                Новый
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                12.05.2024
              </span>
              <span className="text-sm font-semibold bg-gray-200 text-gray-800 px-2 py-1 rounded">2400.00 р.</span>
            </div>
            <div className="text-gray-400 font-bold px-2">v</div>
          </div>
          
          {/* Тело заказа */}
          <div className="p-4 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Товары</p>
              <div className="space-y-3">
                <div className="flex gap-4 p-3 border border-gray-200 rounded items-center">
                  <div className="w-12 h-16 bg-gray-200 flex items-center justify-center rounded text-[10px] text-gray-500">Фото</div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium bg-gray-100 text-gray-800 px-1 rounded w-fit">Название книги</span>
                    <span className="text-xs text-gray-500 bg-gray-50 px-1 rounded w-fit">Автор</span>
                  </div>
                  <div className="ml-auto text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                    1 шт. × 1200 р.
                  </div>
                </div>
                <div className="flex gap-4 p-3 border border-gray-200 rounded items-center">
                  <div className="w-12 h-16 bg-gray-200 flex items-center justify-center rounded text-[10px] text-gray-500">Фото</div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium bg-gray-100 text-gray-800 px-1 rounded w-fit">Другая книга</span>
                    <span className="text-xs text-gray-500 bg-gray-50 px-1 rounded w-fit">Автор</span>
                  </div>
                  <div className="ml-auto text-sm font-semibold bg-gray-100 px-2 py-1 rounded">
                    1 шт. × 1200 р.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Доставка</p>
              <p className="text-sm bg-gray-100 text-gray-800 px-1 rounded w-fit mb-1">Иван Иванов</p>
              <p className="text-sm text-gray-500 bg-gray-50 px-1 rounded w-fit mb-1">+7 (999) 000-00-00</p>
              <p className="text-sm text-gray-500 bg-gray-50 px-1 rounded w-fit mb-1">г. Москва, ул. Примерная, д. 10, кв. 5</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="h-9 px-4 bg-gray-200 text-gray-700 border border-gray-300 text-sm font-medium rounded opacity-80">
                Отменить заказ
              </button>
            </div>
          </div>
        </div>

        {/* Свернутый заказ */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <div className="w-full flex flex-wrap items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-sm bg-gray-200 text-gray-800 px-2 py-1 rounded">ORD-987654</span>
              {/* Упрощенный бейдж статуса "Доставлен" */}
              <span className="text-xs px-2 py-1 font-medium bg-gray-200 text-gray-700 rounded border border-gray-300">
                Доставлен
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                01.05.2024
              </span>
              <span className="text-sm font-semibold bg-gray-200 text-gray-800 px-2 py-1 rounded">1500.00 р.</span>
            </div>
            <div className="text-gray-400 font-bold px-2">{">"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}