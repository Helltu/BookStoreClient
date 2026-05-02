"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import apiClient from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BookItemCard } from "@/components/book-item-card";
import { AddressFormLIQ, AddressResult } from "@/components/address-form";

interface Address {
  id: string;
  addressText: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { items, clearCart, removeItem, updateQuantity, updateStockQuantity } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | "new" | "">("");
  const [newAddressResult, setNewAddressResult] = useState<AddressResult | null>(null);

  const [recipient, setRecipient] = useState({ firstName: "", lastName: "", phone: "" });
  const [touchedR, setTouchedR] = useState({ firstName: false, lastName: false, phone: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setRecipient({
        firstName: (user as any).firstName || "",
        lastName: (user as any).lastName || "",
        phone: (user as any).contactPhone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || items.length === 0) return;
    items.forEach((item) => {
      apiClient.get(`/catalog/books/${item.bookId}`).then((res) => {
        updateStockQuantity(item.bookId, res.data.stockQuantity ?? 0);
      }).catch(() => {});
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiClient.get("/users/me").then((res) => {
      const addrs: Address[] = res.data.addresses || [];
      setAddresses(addrs);
      if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
      else setSelectedAddressId("new");
    }).catch(() => {});
  }, [isAuthenticated]);

  const recipientErrors = {
    firstName: !recipient.firstName ? "Обязательное поле" : undefined,
    lastName: !recipient.lastName ? "Обязательное поле" : undefined,
    phone: !recipient.phone
      ? "Обязательное поле"
      : !/^\+?[0-9]{10,15}$/.test(recipient.phone)
      ? "Неверный формат"
      : undefined,
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const inputClass = (error?: string, isTouched?: boolean) =>
    cn(
      "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 transition-colors",
      !isTouched ? "border-input focus-visible:ring-ring" :
      error ? "border-red-500 focus-visible:ring-red-500" :
      "border-green-500 focus-visible:ring-green-500"
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedR({ firstName: true, lastName: true, phone: true });
    if (Object.values(recipientErrors).some(Boolean)) return;
    if (items.length === 0) { toast.error("Корзина пуста"); return; }

    if (selectedAddressId === "new" && !newAddressResult) {
      toast.error("Заполните все поля адреса");
      return;
    }

    let addressString = "";
    if (selectedAddressId === "new" && newAddressResult) {
      const a = newAddressResult;
      const apt = a.apartment ? `, кв. ${a.apartment}` : "";
      addressString = `${a.country}, ${a.city}${a.state ? `, ${a.state}` : ""}, ${a.street}${apt}${a.postalCode ? `, ${a.postalCode}` : ""}`;
    } else {
      const found = addresses.find((a) => a.id === selectedAddressId);
      if (found) addressString = found.addressText;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post("/orders", {
        items: items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
        deliveryDetails: {
          customerName: `${recipient.firstName} ${recipient.lastName}`.trim(),
          phone: recipient.phone,
          address: addressString,
        },
      });
      clearCart();
      toast.success("Заказ оформлен!");
      if (selectedAddressId === "new" && addressString) {
        toast.info("Сохранить адрес?", {
          description: addressString,
          duration: Infinity,
          action: {
            label: "Сохранить",
            onClick: async () => {
              try {
                await apiClient.post("/users/me/addresses", { addressText: addressString });
                toast.success("Адрес сохранён");
              } catch { /* handled by interceptor */ }
            },
          },
          cancel: { label: "Пропустить", onClick: () => {} },
        });
      }
      router.push("/profile?tab=orders");
    } catch {
      // handled by axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Корзина пуста</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Оформление заказа</h1>
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Recipient */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Получатель</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">Имя *</label>
              <input
                className={inputClass(recipientErrors.firstName, touchedR.firstName)}
                value={recipient.firstName}
                onChange={(e) => setRecipient((p) => ({ ...p, firstName: e.target.value }))}
                onBlur={() => setTouchedR((p) => ({ ...p, firstName: true }))}
              />
              {touchedR.firstName && recipientErrors.firstName && (
                <p className="text-xs text-red-500">{recipientErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">Фамилия *</label>
              <input
                className={inputClass(recipientErrors.lastName, touchedR.lastName)}
                value={recipient.lastName}
                onChange={(e) => setRecipient((p) => ({ ...p, lastName: e.target.value }))}
                onBlur={() => setTouchedR((p) => ({ ...p, lastName: true }))}
              />
              {touchedR.lastName && recipientErrors.lastName && (
                <p className="text-xs text-red-500">{recipientErrors.lastName}</p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium leading-none">Телефон *</label>
              <input
                className={inputClass(recipientErrors.phone, touchedR.phone)}
                value={recipient.phone}
                onChange={(e) => setRecipient((p) => ({ ...p, phone: e.target.value }))}
                onBlur={() => setTouchedR((p) => ({ ...p, phone: true }))}
                placeholder="+375291234567"
              />
              {touchedR.phone && recipientErrors.phone && (
                <p className="text-xs text-red-500">{recipientErrors.phone}</p>
              )}
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Адрес доставки</h2>
          {addresses.length > 0 && (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={cn(
                    "flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                    selectedAddressId === addr.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-0.5"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <span className="text-sm">{addr.addressText}</span>
                </label>
              ))}
              <label
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                  selectedAddressId === "new" ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                )}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === "new"}
                  onChange={() => setSelectedAddressId("new")}
                />
                <Plus className="h-4 w-4" />
                <span className="text-sm">Новый адрес</span>
              </label>
            </div>
          )}

          {selectedAddressId === "new" && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <AddressFormLIQ onChange={setNewAddressResult} />
            </div>
          )}
        </section>

        {/* Order items */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Товары</h2>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <BookItemCard
                key={item.bookId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
          <div className="flex justify-between font-semibold pt-1 px-1">
            <span>Итого</span>
            <span>{total.toFixed(2)} р.</span>
          </div>
        </section>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Оформление..." : "Оформить заказ"}
        </Button>
      </form>
    </div>
  );
}
