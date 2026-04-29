"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Heart, MapPin, Lock, User, ShoppingCart, Check } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Address {
  id: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

interface WishlistBook {
  id: string;
  title: string;
  author?: string;
  cost: number;
  coverImageUrl?: string;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InputField({
  label,
  value,
  onChange,
  type = "text",
  error,
  onBlur,
  touched,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  onBlur?: () => void;
  touched?: boolean;
}) {
  const borderClass = !touched
    ? "border-input focus-visible:ring-ring"
    : error
    ? "border-red-500 focus-visible:ring-red-500"
    : "border-green-500 focus-visible:ring-green-500";

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium leading-none">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 transition-colors",
          borderClass
        )}
      />
      {touched && error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Tab: Info ────────────────────────────────────────────────────────────────

function InfoTab() {
  const { user, fetchProfile } = useAuthStore();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [initial, setInitial] = useState({ firstName: "", lastName: "", phone: "" });
  const [touched, setTouched] = useState({ firstName: false, lastName: false, phone: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const values = {
        firstName: (user as any).firstName || "",
        lastName: (user as any).lastName || "",
        phone: (user as any).contactPhone || "",
      };
      setForm(values);
      setInitial(values);
    }
  }, [user]);

  const phoneError = form.phone && !/^\+?[0-9]{10,15}$/.test(form.phone) ? "Неверный формат телефона" : undefined;

  const isDirty =
    form.firstName !== initial.firstName ||
    form.lastName !== initial.lastName ||
    form.phone !== initial.phone;

  const handleBlur = (field: keyof typeof touched) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneError) { setTouched((p) => ({ ...p, phone: true })); return; }
    setIsLoading(true);
    try {
      await apiClient.patch("/users/me", form);
      await fetchProfile();
      toast.success("Профиль обновлён");
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-1">
        <label className="text-sm font-medium leading-none text-muted-foreground">Имя пользователя</label>
        <p className="text-sm font-medium">{user?.username}</p>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium leading-none text-muted-foreground">Email</label>
        <p className="text-sm font-medium">{user?.email}</p>
      </div>
      <InputField
        label="Имя"
        value={form.firstName}
        onChange={(v) => setForm((p) => ({ ...p, firstName: v }))}
        onBlur={() => handleBlur("firstName")}
        touched={touched.firstName}
      />
      <InputField
        label="Фамилия"
        value={form.lastName}
        onChange={(v) => setForm((p) => ({ ...p, lastName: v }))}
        onBlur={() => handleBlur("lastName")}
        touched={touched.lastName}
      />
      <InputField
        label="Телефон"
        value={form.phone}
        onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
        onBlur={() => handleBlur("phone")}
        touched={touched.phone}
        error={phoneError}
      />
      <Button type="submit" disabled={isLoading || !isDirty}>
        {isLoading ? "Сохранение..." : "Сохранить"}
      </Button>
    </form>
  );
}

// ─── Tab: Password ────────────────────────────────────────────────────────────

function PasswordTab() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [touched, setTouched] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.currentPassword) errors.currentPassword = "Обязательное поле";
    if (!form.newPassword) errors.newPassword = "Обязательное поле";
    else if (!/^(?=.*[0-9])(?=.*[a-zA-Z]).{8,}$/.test(form.newPassword))
      errors.newPassword = "Минимум 8 символов, хотя бы 1 буква и 1 цифра";
    if (!form.confirmPassword) errors.confirmPassword = "Обязательное поле";
    else if (form.confirmPassword !== form.newPassword) errors.confirmPassword = "Пароли не совпадают";
    return errors;
  };

  const errors = validate();
  const isFilled = !!(form.currentPassword && form.newPassword && form.confirmPassword);
  const handleBlur = (field: keyof typeof touched) =>
    setTouched((p) => ({ ...p, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    if (Object.keys(errors).length > 0) return;
    setIsLoading(true);
    try {
      await apiClient.put("/users/me/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Пароль изменён");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTouched({ currentPassword: false, newPassword: false, confirmPassword: false });
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <InputField
        label="Текущий пароль"
        type={showPasswords ? "text" : "password"}
        value={form.currentPassword}
        onChange={(v) => setForm((p) => ({ ...p, currentPassword: v }))}
        onBlur={() => handleBlur("currentPassword")}
        touched={touched.currentPassword}
        error={errors.currentPassword}
      />
      <InputField
        label="Новый пароль"
        type={showPasswords ? "text" : "password"}
        value={form.newPassword}
        onChange={(v) => setForm((p) => ({ ...p, newPassword: v }))}
        onBlur={() => handleBlur("newPassword")}
        touched={touched.newPassword}
        error={errors.newPassword}
      />
      <InputField
        label="Подтвердите новый пароль"
        type={showPasswords ? "text" : "password"}
        value={form.confirmPassword}
        onChange={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
        onBlur={() => handleBlur("confirmPassword")}
        touched={touched.confirmPassword}
        error={errors.confirmPassword}
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="showPasswords"
          checked={showPasswords}
          onChange={(e) => setShowPasswords(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <label htmlFor="showPasswords" className="text-sm font-medium leading-none cursor-pointer">
          Показать пароли
        </label>
      </div>
      <Button type="submit" disabled={isLoading || !isFilled}>
        {isLoading ? "Сохранение..." : "Изменить пароль"}
      </Button>
    </form>
  );
}

// ─── Tab: Addresses ───────────────────────────────────────────────────────────

const emptyAddress = { street: "", city: "", state: "", postalCode: "", country: "" };

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: typeof emptyAddress;
  onSave: (data: typeof emptyAddress) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [isLoading, setIsLoading] = useState(false);

  const f = (field: keyof typeof emptyAddress) => (v: string) =>
    setForm((p) => ({ ...p, [field]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(form);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InputField label="Улица" value={form.street} onChange={f("street")} />
        <InputField label="Город" value={form.city} onChange={f("city")} />
        <InputField label="Регион / штат" value={form.state} onChange={f("state")} />
        <InputField label="Почтовый индекс" value={form.postalCode} onChange={f("postalCode")} />
        <InputField label="Страна" value={form.country} onChange={f("country")} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await apiClient.get("/users/me");
      setAddresses(res.data.addresses || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: typeof emptyAddress) => {
    await apiClient.post("/users/me/addresses", data);
    toast.success("Адрес добавлен");
    setShowAddForm(false);
    load();
  };

  const handleEdit = async (id: string, data: typeof emptyAddress) => {
    await apiClient.patch(`/users/me/addresses/${id}`, data);
    toast.success("Адрес обновлён");
    setEditingId(null);
    load();
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/users/me/addresses/${id}`);
    toast.success("Адрес удалён");
    load();
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка...</p>;

  return (
    <div className="space-y-4 max-w-lg">
      {addresses.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground">Адресов нет</p>
      )}
      {addresses.map((addr) =>
        editingId === addr.id ? (
          <AddressForm
            key={addr.id}
            initial={{ street: addr.street, city: addr.city, state: addr.state || "", postalCode: addr.postalCode, country: addr.country }}
            onSave={(data) => handleEdit(addr.id, data)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={addr.id} className="flex items-start justify-between p-4 border rounded-lg">
            <div className="text-sm space-y-0.5">
              <p className="font-medium">{addr.street}</p>
              <p className="text-muted-foreground">{addr.city}{addr.state ? `, ${addr.state}` : ""}, {addr.postalCode}</p>
              <p className="text-muted-foreground">{addr.country}</p>
            </div>
            <div className="flex gap-1 shrink-0 ml-4">
              <Button variant="ghost" size="icon" onClick={() => setEditingId(addr.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(addr.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        )
      )}
      {showAddForm ? (
        <AddressForm initial={emptyAddress} onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
      ) : (
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4" />
          Добавить адрес
        </Button>
      )}
    </div>
  );
}

// ─── Tab: Wishlist ────────────────────────────────────────────────────────────

function WishlistTab() {
  const [items, setItems] = useState<WishlistBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const decrement = useWishlistStore((s) => s.decrement);
  const { items: cartItems, addItem: addToCart } = useCartStore();

  const load = async () => {
    try {
      const res = await apiClient.get("/users/me/wishlist");
      setItems(res.data || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRemove = async (id: string) => {
    await apiClient.delete(`/users/me/wishlist/${id}`);
    setItems((p) => p.filter((i) => i.id !== id));
    decrement();
    toast.info("Книга удалена из избранного");
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка...</p>;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Список желаемого пуст</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => {
        const inCart = cartItems.some((c) => c.bookId === item.id);
        return (
          <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
            <Link href={`/book/${item.id}`} className="shrink-0">
              {item.coverImageUrl ? (
                <img src={item.coverImageUrl} alt={item.title} className="h-32 w-22 object-cover rounded" />
              ) : (
                <div className="h-32 w-22 bg-muted rounded flex items-center justify-center">
                  <Heart className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </Link>
            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                <Link href={`/book/${item.id}`} className="font-medium hover:underline line-clamp-2 leading-snug">
                  {item.title}
                </Link>
                {item.author && <p className="text-sm text-muted-foreground mt-1">{item.author}</p>}
              </div>
              <div className="mt-3 space-y-2">
                <p className="text-lg font-bold">{item.cost.toFixed(2)} р.</p>
                <div className="flex gap-2">
                  {inCart ? (
                    <Button asChild size="sm" variant="secondary" className="gap-1.5 flex-1">
                      <Link href="/cart">
                        <Check className="h-3.5 w-3.5" />
                        В корзине
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5 flex-1"
                      onClick={() => {
                        addToCart({ bookId: item.id, title: item.title, price: item.cost, coverUrl: item.coverImageUrl });
                        toast.success("Добавлено в корзину");
                      }}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      В корзину
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleRemove(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "wishlist", label: "Избранное", icon: Heart },
  { id: "info", label: "Личные данные", icon: User },
  { id: "password", label: "Пароль", icon: Lock },
  { id: "addresses", label: "Адреса", icon: MapPin },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabId>(
    (searchParams.get("tab") as TabId) || "info"
  );

  useEffect(() => {
    const tab = (searchParams.get("tab") as TabId) || "info";
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "info" && <InfoTab />}
      {activeTab === "password" && <PasswordTab />}
      {activeTab === "addresses" && <AddressesTab />}
      {activeTab === "wishlist" && <WishlistTab />}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center"><p className="text-muted-foreground">Загрузка...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}
