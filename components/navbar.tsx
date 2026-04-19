"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, ShoppingCart, User, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Синхронизируем состояние с URL при перезагрузке страницы
  useEffect(() => {
    setSearchQuery(searchParams.get("query") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("query", searchQuery.trim());
    } else {
      params.delete("query");
    }
    params.delete("page"); // При новом поиске сбрасываем пагинацию на первую страницу
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md hidden sm:flex">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        placeholder="Поиск книг, авторов, жанров..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 pl-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </form>
  );
}

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">

          {/* Левая часть: Логотип и основные ссылки */}
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="inline-block font-bold text-lg">BookStore</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                  href="/"
                  className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Каталог
              </Link>
            </nav>
          </div>

          {/* Центральная часть: Поиск */}
          <div className="flex-1 flex justify-center px-4 md:px-6">
            <Suspense fallback={<div className="h-9 w-full max-w-md hidden sm:block" />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Правая часть: Действия пользователя */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-4">
            <nav className="flex items-center space-x-1 sm:space-x-2">
              {isAuthenticated ? (
                  <>
                 <span className="hidden sm:inline-block text-sm font-medium text-muted-foreground mr-2">
                   Привет, {user?.firstName || user?.username}
                 </span>
                    <Link href="/cart">
                      <Button variant="ghost" size="icon" className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Корзина</span>
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                        <span className="sr-only">Профиль</span>
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={handleLogout} title="Выйти">
                      <LogOut className="h-5 w-5 text-muted-foreground hover:text-destructive transition-colors" />
                      <span className="sr-only">Выйти</span>
                    </Button>
                  </>
              ) : (
                  <>
                    <Button variant="ghost" asChild className="hidden sm:inline-flex">
                      <Link href="/login">Войти</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/register">Регистрация</Link>
                    </Button>
                  </>
              )}
            </nav>
          </div>

        </div>
      </header>
  );
}