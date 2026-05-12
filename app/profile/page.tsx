"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Heart, MapPin, Lock, User, ShoppingCart, Check, Package, ChevronDown, ChevronUp } from "lucide-react";
import apiClient from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AddressFormLIQ, AddressResult } from "@/components/address-form";
import { BookItemCard } from "@/components/book-item-card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Address {
  id: string;
  addressText: string;
  addressName?: string;
  isDefault?: boolean;
}

interface WishlistBook {
  id: string;
  title: string;
  author?: string;
  authors?: string[];
  cost: number;
  coverImageUrl?: string;
  averageRating?: number;
  totalReviews?: number;
  stockQuantity?: number;
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

function parseAddressText(addressText: string): Partial<AddressResult> {
  const parts = addressText.split(",").map((s) => s.trim());
  const postalCode = parts.at(-1)?.match(/^\d{6}$/) ? parts.at(-1)! : "";
  const withoutPostal = postalCode ? parts.slice(0, -1) : parts;

  const aptMatch = addressText.match(/кв\.\s*(.+?)(?:,|$)/);
  const apartment = aptMatch?.[1]?.trim() ?? "";

  const country = withoutPostal[0] ?? "Беларусь";
  const city = withoutPostal[1] ?? "";
  const thirdPart = withoutPostal[2] ?? "";
  const isRegion = /область|район|обл\.|р-н/i.test(thirdPart);
  const state = isRegion ? thirdPart : "";
  const streetStart = isRegion ? 3 : 2;
  const aptIdx = withoutPostal.findIndex((p) => /кв\./i.test(p));
  const streetEnd = aptIdx === -1 ? withoutPostal.length : aptIdx;
  const street = withoutPostal.slice(streetStart, streetEnd).join(", ");

  return { country, city, state, street, apartment, postalCode };
}

function NewAddressPanel({
  onSave,
  onCancel,
}: {
  onSave: (r: AddressResult, addressName: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [result, setResult] = useState<AddressResult | null>(null);
  const [addressName, setAddressName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!result) return;
    setIsLoading(true);
    try { await onSave(result, addressName); } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="space-y-1">
        <label className="text-sm font-medium leading-none">Название адреса</label>
        <input
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={addressName}
          onChange={(e) => setAddressName(e.target.value)}
          placeholder="Например: Дом, Работа..."
        />
      </div>
      <AddressFormLIQ onChange={setResult} />
      <div className="flex gap-2 pt-1">
        <Button size="sm" disabled={isLoading || !result} onClick={handleSave}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Отмена</Button>
      </div>
    </div>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAddressName, setEditAddressName] = useState("");
  const [editAddressResult, setEditAddressResult] = useState<AddressResult | null>(null);

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

  const handleAdd = async (r: AddressResult, addressName: string) => {
    const apt = r.apartment ? `, кв. ${r.apartment}` : "";
    const addressText = `${r.country}, ${r.city}${r.state ? `, ${r.state}` : ""}, ${r.street}${apt}${r.postalCode ? `, ${r.postalCode}` : ""}`;
    const isFirst = addresses.length === 0;
    await apiClient.post("/users/me/addresses", { addressText, addressName: addressName || undefined, isDefault: isFirst });
    toast.success("Адрес добавлен");
    setShowAddForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await apiClient.delete(`/users/me/addresses/${id}`);
    toast.success("Адрес удалён");
    load();
  };

  const handleSetDefault = async (id: string) => {
    await apiClient.patch(`/users/me/addresses/${id}`, { isDefault: true });
    load();
  };

  const startEdit = (addr: Address) => {
    setEditingId(addr.id);
    setEditAddressName(addr.addressName || "");
    setEditAddressResult(parseAddressText(addr.addressText));
  };

  const handleEditSave = async (id: string, addr: Address) => {
    const apt = editAddressResult?.apartment ? `, кв. ${editAddressResult.apartment}` : "";
    const r = editAddressResult!;
    const newAddressText = `${r.country}, ${r.city}${r.state ? `, ${r.state}` : ""}, ${r.street}${apt}${r.postalCode ? `, ${r.postalCode}` : ""}`;
    const nameChanged = editAddressName !== (addr.addressName || "");
    const addressChanged = newAddressText !== addr.addressText;
    if (!nameChanged && !addressChanged) return;
    await apiClient.patch(`/users/me/addresses/${id}`, {
      ...(nameChanged ? { addressName: editAddressName || undefined } : {}),
      ...(addressChanged ? { addressText: newAddressText } : {}),
    });
    toast.success("Адрес обновлён");
    setEditingId(null);
    load();
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка...</p>;

  return (
    <div className="space-y-3 max-w-lg">
      {addresses.length === 0 && !showAddForm && (
        <p className="text-sm text-muted-foreground">Адресов нет</p>
      )}
      {addresses.map((addr) => (
        <div
          key={addr.id}
          className={cn(
            "border rounded-lg overflow-hidden transition-colors",
            !addr.isDefault && editingId !== addr.id && "cursor-pointer hover:border-primary/50",
            addr.isDefault && "border-primary"
          )}
          onClick={() => { if (!addr.isDefault && editingId !== addr.id) handleSetDefault(addr.id); }}
        >
          {editingId === addr.id ? (
            <div className="p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Название адреса</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editAddressName}
                  onChange={(e) => setEditAddressName(e.target.value)}
                  placeholder="Например: Дом, Работа..."
                />
              </div>
              <AddressFormLIQ
                key={addr.id}
                initialValue={parseAddressText(addr.addressText)}
                onChange={setEditAddressResult}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={
                    editAddressName === (addr.addressName || "") &&
                    (() => {
                      if (!editAddressResult) return true;
                      const apt = editAddressResult.apartment ? `, кв. ${editAddressResult.apartment}` : "";
                      const r = editAddressResult;
                      const newText = `${r.country}, ${r.city}${r.state ? `, ${r.state}` : ""}, ${r.street}${apt}${r.postalCode ? `, ${r.postalCode}` : ""}`;
                      return newText === addr.addressText;
                    })()
                  }
                  onClick={() => handleEditSave(addr.id, addr)}
                >
                  Сохранить
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Отмена</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between p-4">
              <div className="space-y-1 text-sm min-w-0">
                <div className="flex items-center gap-2">
                  {addr.addressName && <span className="font-medium">{addr.addressName}</span>}
                  {addr.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      По умолчанию
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{addr.addressText}</p>
              </div>
              <div className="flex gap-1 shrink-0 ml-4">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); startEdit(addr); }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(addr.id); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      {showAddForm ? (
        <NewAddressPanel
          onSave={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      ) : (
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4" />
          Добавить адрес
        </Button>
      )}
    </div>
  );
}

// ─── Tab: Orders ─────────────────────────────────────────────────────────────

type OrderStatus = "NEW" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURN_REQUESTED" | "RETURNED";

interface OrderItem {
  id: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  quantity: number;
  pricePerItem: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalCost: number;
  createdAt: string;
  orderItems: OrderItem[];
  deliveryDetails: {
    customerName: string;
    contactPhone: string;
    addressText: string;
    deliveryTimeSlot?: string;
    deliveryDate?: string;
  };
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  PROCESSING: "В обработке",
  SHIPPED: "Доставляется",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
  RETURN_REQUESTED: "Запрос возврата",
  RETURNED: "Возвращён",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURN_REQUESTED: "bg-orange-100 text-orange-700",
  RETURNED: "bg-gray-100 text-gray-700",
};

function OrderItemCard({ item }: { item: OrderItem }) {
  const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined);
  const [authors, setAuthors] = useState<string[] | undefined>(undefined);
  const [averageRating, setAverageRating] = useState<number | undefined>(undefined);
  const [totalReviews, setTotalReviews] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!item.bookId) return;
    apiClient.get(`/catalog/books/${item.bookId}`).then((res) => {
      const b = res.data;
setCoverUrl(b.coverUrl ?? undefined);
      setAuthors(b.authors ?? undefined);
      setAverageRating(b.averageRating ?? undefined);
      setTotalReviews(b.totalReviews ?? undefined);
    }).catch(() => {});
  }, [item.bookId]);

  return (
    <BookItemCard
      item={{
        bookId: item.bookId,
        title: item.bookTitle,
        price: item.pricePerItem,
        quantity: item.quantity,
        coverUrl,
        authors,
        averageRating,
        totalReviews,
      }}
    />
  );
}

function OrderCard({ order, onRefresh }: { order: Order; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/orders/${order.id}/cancel`);
      toast.success("Заказ отменён");
      onRefresh();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnRequest = async () => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/orders/${order.id}/return-request`);
      toast.success("Запрос на возврат отправлен");
      onRefresh();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-sm">{order.orderNumber}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status])}>
            {STATUS_LABELS[order.status]}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("ru-RU")}
          </span>
          <span className="text-sm font-semibold">{order.totalCost.toFixed(2)} р.</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Товары</p>
            <div className="space-y-3">
              {(order.orderItems ?? []).length === 0
                ? <p className="text-sm text-muted-foreground">Нет данных о товарах</p>
                : (order.orderItems ?? []).map((item) => <OrderItemCard key={item.id} item={item} />)
              }
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Доставка</p>
            <p className="text-sm">{order.deliveryDetails.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.deliveryDetails.contactPhone}</p>
            <p className="text-sm text-muted-foreground">{order.deliveryDetails.addressText}</p>
            {order.deliveryDetails.deliveryDate && (
              <p className="text-sm text-muted-foreground">
                {order.deliveryDetails.deliveryDate}
                {order.deliveryDetails.deliveryTimeSlot ? `, ${order.deliveryDetails.deliveryTimeSlot}` : ""}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {order.status === "NEW" && (
              <Button size="sm" variant="destructive" disabled={isLoading} onClick={handleCancel}>
                Отменить заказ
              </Button>
            )}
            {order.status === "DELIVERED" && (
              <Button size="sm" variant="destructive" disabled={isLoading} onClick={handleReturnRequest}>
                Запросить возврат
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      const res = await apiClient.get("/orders/my");
setOrders(res.data || []);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка...</p>;
  if (orders.length === 0) return <p className="text-sm text-muted-foreground">Заказов ещё нет</p>;

  return (
    <div className="space-y-3 max-w-2xl">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} onRefresh={load} />
      ))}
    </div>
  );
}

// ─── Tab: Wishlist ────────────────────────────────────────────────────────────

function WishlistTab() {
  const [items, setItems] = useState<WishlistBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { decrement } = useWishlistStore();

  const load = async () => {
    try {
      const res = await apiClient.get("/users/me/wishlist");
      const wishlist: WishlistBook[] = res.data || [];
      const full = await Promise.all(
        wishlist.map((w) =>
          apiClient.get(`/catalog/books/${w.id}`).then((r) => ({
            ...w,
            authors: r.data.authors,
            averageRating: r.data.averageRating,
            totalReviews: r.data.totalReviews,
            stockQuantity: r.data.stockQuantity,
          })).catch(() => w)
        )
      );
      setItems(full);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (isLoading) return <p className="text-sm text-muted-foreground">Загрузка...</p>;
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Список желаемого пуст</p>;

  const handleRemove = async (bookId: string) => {
    await apiClient.delete(`/users/me/wishlist/${bookId}`);
    setItems((p) => p.filter((i) => i.id !== bookId));
    decrement();
    toast.info("Книга удалена из избранного");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => (
        <BookItemCard
          key={item.id}
          item={{ bookId: item.id, title: item.title, price: item.cost, quantity: 1, coverUrl: item.coverImageUrl, authors: item.authors ?? (item.author ? [item.author] : []), averageRating: item.averageRating, totalReviews: item.totalReviews, stockQuantity: item.stockQuantity }}
          onRemoveFromWishlist={handleRemove}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "wishlist", label: "Избранное", icon: Heart },
  { id: "info", label: "Личные данные", icon: User },
  { id: "password", label: "Пароль", icon: Lock },
  { id: "addresses", label: "Адреса", icon: MapPin },
  { id: "orders", label: "Мои заказы", icon: Package },
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
      {activeTab === "orders" && <OrdersTab />}
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
