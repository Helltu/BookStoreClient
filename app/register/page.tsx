"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.username) errors.username = "Имя пользователя обязательно";
    else if (!/^[a-zA-Z0-9._]{4,20}$/.test(formData.username)) errors.username = "От 4 до 20 символов (только буквы, цифры, . и _)";

    if (!formData.email) errors.email = "Email обязателен";
    else if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(formData.email)) errors.email = "Неверный формат email";

    if (!formData.password) errors.password = "Пароль обязателен";
    else if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/.test(formData.password)) errors.password = "Минимум 8 символов, хотя бы 1 буква и 1 цифра";

    if (!formData.confirmPassword) errors.confirmPassword = "Подтвердите пароль";
    else if (formData.confirmPassword !== formData.password) errors.confirmPassword = "Пароли не совпадают";

    return errors;
  };

  const errors = validate();

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getInputClass = (field: keyof typeof touched) => {
    if (!touched[field]) return "border-input focus-visible:ring-ring";
    if (errors[field]) return "border-red-500 focus-visible:ring-red-500";
    return "border-green-500 focus-visible:ring-green-500";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(errors).length > 0) {
      toast.error("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    setIsLoading(true);

    try {
      // Исключаем confirmPassword при отправке на сервер
      const { confirmPassword, ...dataToSend } = formData;
      const res = await apiClient.post("/auth/register", dataToSend);
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
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 transition-colors",
                getInputClass("username")
              )}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              onBlur={() => handleBlur("username")}
              required
            />
            {touched.username && errors.username && (
              <p className="text-xs text-red-500">{errors.username}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Email *</label>
            <input
              type="email"
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 transition-colors",
                getInputClass("email")
              )}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => handleBlur("email")}
              required
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Пароль *</label>
            <input
              type={showPassword ? "text" : "password"}
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 transition-colors",
                getInputClass("password")
              )}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onBlur={() => handleBlur("password")}
              required
            />
            {touched.password && errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Подтвердите пароль *</label>
            <input
              type={showPassword ? "text" : "password"}
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 transition-colors",
                getInputClass("confirmPassword")
              )}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              onBlur={() => handleBlur("confirmPassword")}
              required
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword}</p>
            )}
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