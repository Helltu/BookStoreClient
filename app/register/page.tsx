"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiClient.post("/auth/register", formData);
      login(res.data.token);
      toast.success("Регистрация успешно завершена!");
      router.push("/");
    } catch (error) {
      // Ошибка обрабатывается в axios.ts
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-sm p-6 sm:p-8">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Создать аккаунт</h1>
          <p className="text-sm text-muted-foreground">Заполните форму ниже для регистрации</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Имя пользователя *</label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Email *</label>
            <input
              type="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Пароль *</label>
            <input
              type="password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Имя</label>
              <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Фамилия</label>
              <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          Уже есть аккаунт? <Link href="/login" className="font-medium text-primary hover:underline">Войти</Link>
        </div>
      </div>
    </div>
  );
}