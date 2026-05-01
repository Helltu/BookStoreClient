"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, Tag, Building, LayoutDashboard, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/manager", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/manager/books", label: "Книги", icon: BookOpen },
  { href: "/manager/authors", label: "Авторы", icon: Users },
  { href: "/manager/genres", label: "Жанры", icon: Tag },
  { href: "/manager/publishers", label: "Издательства", icon: Building },
  { href: "/manager/orders", label: "Заказы", icon: ShoppingCart },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isLoading && mounted) {
      if (!isAuthenticated || user?.role !== "MANAGER") {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, user, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "MANAGER") {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-64 border-r bg-muted/30 p-4 hidden md:block">
        <div className="mb-6 px-3">
          <h2 className="text-lg font-semibold">Панель управления</h2>
          <p className="text-xs text-muted-foreground mt-1">Управление магазином</p>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 md:hidden border-b bg-muted/30 px-4 py-2">
        <nav className="flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main id="manager-main" className="flex-1 p-6 overflow-y-auto flex flex-col h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
}
