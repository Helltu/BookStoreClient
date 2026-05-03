import Link from "next/link";

export default function WireframesIndex() {
  return (
    <div className="flex flex-col flex-1 p-8 relative min-h-screen">
      <main className="flex flex-col gap-8 w-full max-w-7xl mx-auto z-10 relative">
        <h1 className="text-4xl font-bold tracking-tight">Макеты страниц (Wireframes)</h1>
        <p className="text-lg text-muted-foreground">
          Список страниц-макетов, созданных для имитации дизайна в Figma.
        </p>

        <ul className="list-disc pl-5 flex flex-col gap-4">
          <li>
            <Link href="/wireframes/home" className="text-blue-500 hover:underline text-lg">
              Главная страница (Каталог)
            </Link>
          </li>
          <li>
            <Link href="/wireframes/book/1" className="text-blue-500 hover:underline text-lg">
              Страница книги
            </Link>
          </li>
          <li>
            <Link href="/wireframes/cart" className="text-blue-500 hover:underline text-lg">
              Корзина
            </Link>
          </li>
          <li>
            <Link href="/wireframes/checkout" className="text-blue-500 hover:underline text-lg">
              Оформление заказа
            </Link>
          </li>
          <li>
            <Link href="/wireframes/ai-consultant" className="text-blue-500 hover:underline text-lg">
              ИИ-Ассистент (Демонстрационная страница)
            </Link>
          </li>
          <li>
            <span className="text-lg font-semibold mt-4 block">Менеджерская часть:</span>
            <ul className="list-circle pl-5 flex flex-col gap-2 mt-2">
              <li>
                <Link href="/wireframes/manager" className="text-blue-500 hover:underline">
                  Панель менеджера (Обзор / Аналитика)
                </Link>
              </li>
              <li>
                <Link href="/wireframes/manager/books" className="text-blue-500 hover:underline">
                  Управление книгами (Таблица)
                </Link>
              </li>
              <li>
                <Link href="/wireframes/manager/books/new" className="text-blue-500 hover:underline">
                  Добавление / Редактирование книги (Форма)
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <span className="text-lg font-semibold mt-4 block">Профиль пользователя (вкладки):</span>
            <ul className="list-circle pl-5 flex flex-col gap-2 mt-2">
              <li>
                <Link href="/wireframes/profile/info" className="text-blue-500 hover:underline">
                  Личные данные
                </Link>
              </li>
              <li>
                <Link href="/wireframes/profile/password" className="text-blue-500 hover:underline">
                  Пароль
                </Link>
              </li>
              <li>
                <Link href="/wireframes/profile/addresses" className="text-blue-500 hover:underline">
                  Адреса
                </Link>
              </li>
              <li>
                <Link href="/wireframes/profile/wishlist" className="text-blue-500 hover:underline">
                  Избранное
                </Link>
              </li>
              <li>
                <Link href="/wireframes/profile/orders" className="text-blue-500 hover:underline">
                  Мои заказы
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </main>

      {/* Floating button for AI Consultant on the main wireframes page */}
      <Link 
        href="/wireframes/ai-consultant" 
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gray-300 text-gray-700 shadow-lg border border-gray-400 font-bold hover:bg-gray-400 transition-colors"
      >
        Чат
      </Link>
    </div>
  );
}