import Link from "next/link";

export default function ProfileInfoWireframe() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8">
        <Link href="/wireframes/profile/wishlist" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Избранное</Link>
        <Link href="/wireframes/profile/info" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded opacity-80">Личные данные</Link>
        <Link href="/wireframes/profile/password" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Пароль</Link>
        <Link href="/wireframes/profile/addresses" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Адреса</Link>
        <Link href="/wireframes/profile/orders" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Мои заказы</Link>
      </div>

      <div className="space-y-4 max-w-md">
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none text-muted-foreground">Имя пользователя</label>
          <p className="text-sm font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded w-fit">username123</p>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none text-muted-foreground">Email</label>
          <p className="text-sm font-medium bg-gray-200 text-gray-800 px-2 py-1 rounded w-fit">user@example.com</p>
        </div>

        <div className="space-y-1 mt-4">
          <label className="text-sm font-medium leading-none">Имя</label>
          <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
            Иван
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">Фамилия</label>
          <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
            Иванов
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">Телефон</label>
          <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
            +7 (999) 000-00-00
          </div>
        </div>

        <button className="h-10 px-4 mt-2 bg-primary text-primary-foreground font-medium rounded opacity-80">
          Сохранить
        </button>
      </div>
    </div>
  );
}