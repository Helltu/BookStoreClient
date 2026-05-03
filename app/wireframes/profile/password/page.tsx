import Link from "next/link";

export default function ProfilePasswordWireframe() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8">
        <Link href="/wireframes/profile/wishlist" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Избранное</Link>
        <Link href="/wireframes/profile/info" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Личные данные</Link>
        <Link href="/wireframes/profile/password" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded opacity-80">Пароль</Link>
        <Link href="/wireframes/profile/addresses" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Адреса</Link>
        <Link href="/wireframes/profile/orders" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Мои заказы</Link>
      </div>

      <div className="space-y-4 max-w-md">
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">Текущий пароль</label>
          <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
            ••••••••
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">Новый пароль</label>
          <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
            ••••••••
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">Подтвердите новый пароль</label>
          <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
            ••••••••
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 border border-gray-400 rounded bg-white"></div>
          <label className="text-sm font-medium leading-none cursor-pointer">
            Показать пароли
          </label>
        </div>
        <button className="h-10 px-4 mt-2 bg-primary text-primary-foreground font-medium rounded opacity-80">
          Изменить пароль
        </button>
      </div>
    </div>
  );
}