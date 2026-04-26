"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/authenticate", formData);
      login(res.data.token);
      toast.success("Вы успешно вошли в систему!");

      const profileRes = await apiClient.get("/users/me");
      if (profileRes.data.role === "MANAGER") {
        router.push("/manager");
      } else {
        router.push("/");
      }
    } catch (error) {
      // Ошибка уже выводится глобальным перехватчиком (interceptor) в axios.ts
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-sm p-6 sm:p-8">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">С возвращением</h1>
          <p className="text-sm text-muted-foreground">Введите имя пользователя и пароль для входа</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Имя пользователя</label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              placeholder="user123"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Пароль</label>
            <input
              type={showPassword ? "text" : "password"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            <label htmlFor="showPassword" className="text-sm font-medium leading-none cursor-pointer">
              Показать пароль
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Вход..." : "Войти"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Нет аккаунта? <Link href="/register" className="font-medium text-primary hover:underline">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}