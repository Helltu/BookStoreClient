import Link from "next/link";

export default function ProfileWishlistWireframe() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8">
        <Link href="/wireframes/profile/wishlist" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded opacity-80">Избранное</Link>
        <Link href="/wireframes/profile/info" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Личные данные</Link>
        <Link href="/wireframes/profile/password" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Пароль</Link>
        <Link href="/wireframes/profile/addresses" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Адреса</Link>
        <Link href="/wireframes/profile/orders" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Мои заказы</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white border border-gray-300 rounded-lg shadow-sm items-center">
            {/* Обложка */}
            <div className="w-16 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center border border-gray-300">
              <span className="text-[10px] text-gray-500">Обложка</span>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <div className="text-base font-semibold bg-gray-200 text-gray-800 px-1 rounded w-fit">Название книги</div>
              <div className="text-xs bg-gray-100 text-gray-600 px-1 rounded w-fit">Автор книги</div>
              <div className="font-bold text-sm bg-gray-200 text-gray-800 px-1 rounded w-fit mt-1">1200 р.</div>
            </div>
            
            <button className="p-2 bg-red-100 text-red-600 rounded border border-red-200 ml-auto flex-shrink-0 text-xs font-medium">
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}