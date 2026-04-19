import Link from "next/link";
import { Search, ShoppingCart, Heart, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4 gap-4">
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold tracking-tight text-primary">
            Book<span className="text-foreground">Store</span>
          </span>
        </Link>

        {/* Поисковая строка (занимает доступное пространство) */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto hidden md:flex">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Найти книгу, автора или жанр..."
              className="w-full bg-muted shadow-none appearance-none pl-8 rounded-full"
            />
          </div>
        </div>

        {/* Иконки действий */}
        <div className="flex items-center justify-end space-x-2 flex-1 md:flex-none">
          {/* Мобильная кнопка поиска */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Поиск</span>
          </Button>

          <Button variant="ghost" size="icon">
            <Bot className="h-5 w-5" />
            <span className="sr-only">AI Ассистент</span>
          </Button>

          <Button variant="ghost" size="icon">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Избранное</span>
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {/* Пример бейджика для корзины (пока хардкод) */}
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              0
            </span>
            <span className="sr-only">Корзина</span>
          </Button>

          <div className="hidden sm:block ml-2">
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" />
              Войти
            </Button>
          </div>
          {/* Мобильная кнопка войти */}
          <Button variant="ghost" size="icon" className="sm:hidden">
            <User className="h-5 w-5" />
            <span className="sr-only">Войти</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
