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

const savedAddresses: SavedAddress[] = [
  { id: 1, label: "Дом", display: "Россия, г. Москва, ул. Примерная, д. 10, кв. 5", isDefault: true },
  { id: 2, label: "Работа", display: "Россия, г. Москва, ул. Тверская, д. 1, оф. 100", isDefault: false },
];

export default function CheckoutWireframe() {
  const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const [selectedId, setSelectedId] = useState<number | "new">(defaultAddr?.id ?? "new");
  const [newAddress, setNewAddress] = useState<AddressResult | null>(null);
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-8 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Оформление заказа</h1>

      <div className="space-y-8">
        {/* Recipient */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">Получатель</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">Имя *</label>
              <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
                Иван
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium leading-none">Фамилия *</label>
              <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
                Иванов
              </div>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium leading-none">Телефон *</label>
              <div className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 items-center">
                +7 (999) 000-00-00
              </div>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">Адрес доставки</h2>

          <div className="space-y-2">
            {savedAddresses.map((addr) => (
              <label key={addr.id} className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer bg-white">
                <input
                  type="radio"
                  name="address"
                  className="mt-0.5"
                  checked={selectedId === addr.id}
                  onChange={() => setSelectedId(addr.id)}
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        По умолчанию
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block">
                    {addr.display}
                  </span>
                </div>
              </label>
            ))}

            <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer bg-white text-gray-500">
              <input
                type="radio"
                name="address"
                checked={selectedId === "new"}
                onChange={() => setSelectedId("new")}
              />
              <span className="text-sm font-medium">+ Новый адрес</span>
            </label>

            {selectedId === "new" && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
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
              </div>
            )}
          </div>
        </section>

        {/* Order items */}
        <section className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">Товары</h2>
          <div className="flex flex-col gap-4">
             {Array.from({ length: 2 }).map((_, i) => (
               <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-300 rounded-lg items-center">
                 <div className="w-16 h-24 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center border border-gray-300">
                   <span className="text-[10px] text-gray-500">Обложка</span>
                 </div>

                 <div className="flex flex-col gap-2 w-full">
                   <div className="text-base font-semibold bg-gray-100 text-gray-800 px-1 rounded w-fit">Название книги</div>
                   <div className="text-xs text-gray-500 bg-gray-50 px-1 rounded w-fit">Автор книги</div>
                 </div>

                 <div className="flex items-center gap-4 mt-4 sm:mt-0 ml-auto flex-shrink-0">
                    <div className="flex items-center border border-gray-300 rounded">
                       <button className="p-1 text-gray-500 bg-gray-50">-</button>
                       <span className="w-6 text-center bg-gray-100 text-gray-800 text-sm">1</span>
                       <button className="p-1 text-gray-500 bg-gray-50">+</button>
                    </div>
                    <div className="font-bold text-sm bg-gray-100 text-gray-800 px-1 rounded">1200 р.</div>
                    <button className="text-red-500 hover:bg-red-50 rounded text-xs font-medium px-2 py-1">
                      Удалить
                    </button>
                 </div>
               </div>
             ))}
          </div>
          <div className="flex justify-between font-semibold pt-2 px-1 text-lg border-t border-gray-200 mt-4">
            <span className="text-gray-700">Итого</span>
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">2400.00 р.</span>
          </div>
        </section>

        <button className="w-full h-12 bg-primary text-primary-foreground font-medium rounded opacity-80 text-lg flex items-center justify-center">
          Оформить заказ
        </button>
      </div>
    </div>
  );
}
