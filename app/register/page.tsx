"use client";

import { useEffect, useRef, useState } from "react";
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

  // ── Step 1 state ──────────────────────────────────────────────────────────
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

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(seconds);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // ── Validation ────────────────────────────────────────────────────────────
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

  // ── Step 1 submit: register ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(errors).length > 0) {
      toast.error("Пожалуйста, исправьте ошибки в форме");
      return;
    }
    setIsLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;
      await apiClient.post("/auth/register", dataToSend);

      // Fetch timer from server
      const timerRes = await apiClient.get(`/auth/verification-timer?email=${encodeURIComponent(formData.email)}`);
      startTimer(timerRes.data.secondsRemaining ?? 60);
      setStep(2);
      toast.success("Код отправлен на ваш email");
    } catch {
      // handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2 submit: verify ─────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Введите 6-значный код");
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/verify-email", { email: formData.email, code });
      login(res.data.token);
      toast.success("Регистрация успешно завершена!");
      router.push("/");
    } catch {
      // handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend code ───────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (secondsLeft > 0) return;
    setIsLoading(true);
    try {
      await apiClient.post(`/auth/resend-verification?email=${encodeURIComponent(formData.email)}`);
      startTimer(60);
      toast.success("Новый код отправлен");
    } catch {
      // handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-sm p-6 sm:p-8">
        <div className="flex flex-col space-y-2 text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Создать аккаунт</h1>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? "Заполните форму ниже для регистрации" : `Введите код, отправленный на ${formData.email}`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
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
              {touched.username && errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
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
              {touched.email && errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
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
              {touched.password && errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
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
              {touched.confirmPassword && errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
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
              {isLoading ? "Отправка..." : "Зарегистрироваться"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Код подтверждения *</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center tracking-[0.4em] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 transition-colors"
                placeholder="______"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Проверка..." : "Подтвердить"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {secondsLeft > 0 ? (
                <span>Повторная отправка через {secondsLeft} с</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  Отправить код повторно
                </button>
              )}
            </div>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:underline"
              >
                ← Назад
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
