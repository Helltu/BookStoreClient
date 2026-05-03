import Link from "next/link";

export default function ProfileAddressesWireframe() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8">
        <Link href="/wireframes/profile/wishlist" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Избранное</Link>
        <Link href="/wireframes/profile/info" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Личные данные</Link>
        <Link href="/wireframes/profile/password" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Пароль</Link>
        <Link href="/wireframes/profile/addresses" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded opacity-80">Адреса</Link>
        <Link href="/wireframes/profile/orders" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Мои заказы</Link>
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="flex items-start justify-between p-4 border border-gray-300 bg-white rounded-lg">
          <div className="text-sm">
            <p className="bg-gray-100 text-gray-700 px-2 py-1 rounded inline-block">
              Россия, г. Москва, ул. Примерная, д. 10, кв. 5
            </p>
          </div>
          <div className="flex gap-1 shrink-0 ml-4">
            <button className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded border border-red-200">
              Удалить
            </button>
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 h-10 px-4 border border-gray-300 bg-gray-100 rounded text-sm font-medium text-gray-700 w-fit">
          <span className="text-lg font-bold leading-none">+</span>
          Добавить адрес
        </button>
      </div>
    </div>
  );
}