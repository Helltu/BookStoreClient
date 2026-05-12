"use client";

import Link from "next/link";
import { useState } from "react";
import { AddressFormLIQ, type AddressResult } from "@/components/address-form";

type SavedAddress = {
  id: number;
  label: string;
  display: string;
  isDefault: boolean;
};

const initialAddresses: SavedAddress[] = [
  { id: 1, label: "Дом", display: "Россия, г. Москва, ул. Примерная, д. 10, кв. 5", isDefault: true },
];

export default function ProfileAddressesWireframe() {
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState<AddressResult | null>(null);
  const [makeDefault, setMakeDefault] = useState(false);

  const [editLabel, setEditLabel] = useState("");
  const [editMakeDefault, setEditMakeDefault] = useState(false);

  function handleAddSubmit() {
    if (!newAddress) return;
    const isFirst = addresses.length === 0;
    const shouldBeDefault = isFirst || makeDefault;
    const display = `${newAddress.country}, г. ${newAddress.city}, ${newAddress.street}, кв. ${newAddress.apartment}`;
    const id = Date.now();
    setAddresses((prev) => {
      const updated = shouldBeDefault ? prev.map((a) => ({ ...a, isDefault: false })) : prev;
      return [...updated, { id, label: newLabel || "Адрес", display, isDefault: shouldBeDefault }];
    });
    setShowAddForm(false);
    setNewLabel("");
    setNewAddress(null);
    setMakeDefault(false);
  }

  function startEdit(addr: SavedAddress) {
    setEditingId(addr.id);
    setEditLabel(addr.label);
    setEditMakeDefault(addr.isDefault);
  }

  function handleEditSubmit(id: number) {
    setAddresses((prev) =>
      prev.map((a) => {
        if (editMakeDefault && a.id !== id) return { ...a, isDefault: false };
        if (a.id === id) return { ...a, label: editLabel || a.label, isDefault: editMakeDefault };
        return a;
      })
    );
    setEditingId(null);
  }

  function handleDelete(id: number) {
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Профиль</h1>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4 mb-8">
        <Link href="/wireframes/profile/wishlist" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Избранное</Link>
        <Link href="/wireframes/profile/info" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Личные данные</Link>
        <Link href="/wireframes/profile/password" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Пароль</Link>
        <Link href="/wireframes/profile/addresses" className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded opacity-80">Адреса</Link>
        <Link href="/wireframes/profile/orders" className="px-4 py-2 bg-gray-100 text-gray-600 font-medium rounded border border-gray-300">Мои заказы</Link>
      </div>

      <div className="space-y-3 max-w-lg">
        {addresses.map((addr) => (
          <div key={addr.id} className="border border-gray-300 bg-white rounded-lg overflow-hidden">
            {editingId === addr.id ? (
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Название адреса</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Например: Дом, Работа..."
                  />
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">{addr.display}</p>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editMakeDefault}
                    onChange={(e) => setEditMakeDefault(e.target.checked)}
                    disabled={addr.isDefault}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm">Использовать по умолчанию</span>
                </label>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleEditSubmit(addr.id)}
                    className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm font-medium rounded border border-gray-300"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between p-4">
                <div className="space-y-1.5 text-sm min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        По умолчанию
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 bg-gray-50 px-2 py-1 rounded">{addr.display}</p>
                </div>
                <div className="flex gap-1 shrink-0 ml-4">
                  <button
                    onClick={() => startEdit(addr)}
                    className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded border border-blue-200"
                  >
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded border border-red-200"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {showAddForm ? (
          <div className="border border-gray-300 bg-white rounded-lg p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Новый адрес</h3>

            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">Название адреса</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Например: Дом, Работа..."
              />
            </div>

            <AddressFormLIQ onChange={setNewAddress} />

            {addresses.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={makeDefault}
                  onChange={(e) => setMakeDefault(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm">Использовать по умолчанию</span>
              </label>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAddSubmit}
                disabled={!newAddress}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded disabled:opacity-40"
              >
                Сохранить
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewLabel(""); setNewAddress(null); setMakeDefault(false); }}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded border border-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center gap-2 h-10 px-4 border border-gray-300 bg-gray-100 rounded text-sm font-medium text-gray-700 w-fit"
          >
            <span className="text-lg font-bold leading-none">+</span>
            Добавить адрес
          </button>
        )}
      </div>
    </div>
  );
}
