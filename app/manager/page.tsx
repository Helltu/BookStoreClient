"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  BookOpen, Users, Tag, Building, Download, Upload, ShoppingCart,
  TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle,
  Package, RotateCcw, Clock, ChevronDown, Search, X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { genresApi, authorsApi, publishersApi, booksApi, importExportApi, analyticsApi, type CatalogEntity, type AnalyticsResponse } from "@/lib/api/manager";
import type { ManagedBook } from "@/lib/types/manager";
import { ordersApi } from "@/lib/api/orders";
import { toast } from "sonner";

// ─── helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: string | number) =>
  parseFloat(String(v)).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtInt = (v: number) => v.toLocaleString("ru-RU");

function Delta({ value }: { value: number | null | undefined }) {
  if (value == null) return <span className="text-xs text-muted-foreground">—</span>;
  const pos = value >= 0;
  const Icon = value === 0 ? Minus : pos ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${pos ? "text-emerald-500" : "text-rose-500"}`}>
      <Icon className="h-3 w-3" />
      {pos ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новые", PROCESSING: "В обработке", SHIPPED: "Отправлены",
  DELIVERED: "Доставлены", RETURN_REQUESTED: "Возврат", RETURNED: "Возвращены",
};
const STATUS_COLORS: Record<string, string> = {
  NEW: "#6366f1", PROCESSING: "#f59e0b", SHIPPED: "#3b82f6",
  DELIVERED: "#22c55e", RETURN_REQUESTED: "#f97316", RETURNED: "#ef4444",
};
const GENRE_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f43f5e","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6","#06b6d4"];

const PRESETS = [
  { label: "7 дней", days: 7 },
  { label: "30 дней", days: 30 },
  { label: "90 дней", days: 90 },
  { label: "Год", days: 365 },
  { label: "Всё время", days: 0 },
];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

// ─── catalog stats ─────────────────────────────────────────────────────────────

interface Stats { books: number; authors: number; genres: number; publishers: number; orders: number }

const catalogCards = [
  { key: "books" as const, label: "Книги", icon: BookOpen, href: "/manager/books", color: "text-blue-500" },
  { key: "authors" as const, label: "Авторы", icon: Users, href: "/manager/authors", color: "text-green-500" },
  { key: "genres" as const, label: "Жанры", icon: Tag, href: "/manager/genres", color: "text-purple-500" },
  { key: "publishers" as const, label: "Издательства", icon: Building, href: "/manager/publishers", color: "text-orange-500" },
];

// ─── sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, delta, sub }: { label: string; value: string; delta?: number | null; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      <div className="flex items-center gap-2 min-h-[1.25rem]">
        {delta !== undefined && <Delta value={delta} />}
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-foreground">{children}</h2>;
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-4 ${className}`}>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </div>
  );
}

// ─── main ──────────────────────────────────────────────────────────────────────

export default function ManagerDashboard() {
  const [stats, setStats] = useState<Stats>({ books: 0, authors: 0, genres: 0, publishers: 0, orders: 0 });
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [ioLoading, setIoLoading] = useState<CatalogEntity | null>(null);
  const [ordersExporting, setOrdersExporting] = useState(false);
  const [ioMessage, setIoMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const fileInputRefs = useRef<Record<CatalogEntity, HTMLInputElement | null>>({
    genres: null, authors: null, publishers: null, books: null,
  });

  // analytics
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [preset, setPreset] = useState(1); // 30 days default
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const loadAnalytics = useCallback(async (startDate?: string, endDate?: string) => {
    setAnalyticsLoading(true);
    try {
      const res = await analyticsApi.get({ startDate, endDate });
      setAnalytics(res.data);
    } catch {
      // interceptor handles toast
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [booksRes, authorsRes, genresRes, publishersRes, ordersRes] = await Promise.all([
          booksApi.getAll(0, 1),
          authorsApi.getAll(),
          genresApi.getAll(),
          publishersApi.getAll(),
          ordersApi.getAll(0, 1),
        ]);
        setStats({
          books: booksRes.data.totalElements,
          authors: authorsRes.data.length,
          genres: genresRes.data.length,
          publishers: publishersRes.data.length,
          orders: ordersRes.data.totalElements,
        });
      } catch { /* interceptor */ } finally { setCatalogLoading(false); }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    const days = PRESETS[preset].days;
    if (days === 0) {
      loadAnalytics();
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      loadAnalytics(toDateStr(start), toDateStr(end));
    }
  }, [preset, loadAnalytics]);

  function applyCustom() {
    if (!customStart || !customEnd) return;
    setShowCustom(false);
    loadAnalytics(customStart, customEnd);
  }

  // catalog IO
  async function handleExport(entity: CatalogEntity) {
    setIoLoading(entity); setIoMessage(null);
    try {
      const res = await importExportApi.export(entity);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a"); a.href = url; a.download = `${entity}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch { setIoMessage({ text: `Ошибка экспорта ${entity}`, ok: false }); }
    finally { setIoLoading(null); }
  }

  async function handleImport(entity: CatalogEntity, file: File) {
    setIoLoading(entity); setIoMessage(null);
    try {
      await importExportApi.import(entity, file);
      setIoMessage({ text: `Импорт ${entity} завершён`, ok: true });
      const [booksRes, authorsRes, genresRes, publishersRes] = await Promise.all([
        booksApi.getAll(0, 1), authorsApi.getAll(), genresApi.getAll(), publishersApi.getAll(),
      ]);
      setStats(s => ({ ...s, books: booksRes.data.totalElements, authors: authorsRes.data.length, genres: genresRes.data.length, publishers: publishersRes.data.length }));
    } catch { setIoMessage({ text: `Ошибка импорта ${entity}`, ok: false }); }
    finally { setIoLoading(null); }
  }

  async function handleExportOrders() {
    setOrdersExporting(true);
    try {
      const res = await ordersApi.export();
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      URL.revokeObjectURL(url);
      toast.success("Экспорт заказов завершён");
    } catch { } finally { setOrdersExporting(false); }
  }

  // ── interactive state ────────────────────────────────────────────────────────
  const router = useRouter();
  const [customerSearch, setCustomerSearch] = useState("");
  const [topBookSearch, setTopBookSearch] = useState("");
  const [slowBookSearch, setSlowBookSearch] = useState("");
  const [hoveredBook, setHoveredBook] = useState<{ title: string; source: "top" | "slow"; details: ManagedBook } | null>(null);
  const bookDetailsCache = useRef<Record<string, ManagedBook>>({});

  async function fetchBookDetails(title: string, source: "top" | "slow") {
    if (bookDetailsCache.current[title]) {
      setHoveredBook({ title, source, details: bookDetailsCache.current[title] });
      return;
    }
    try {
      const res = await booksApi.getAll(0, 1, title);
      const book = res.data.content?.[0];
      if (book) {
        bookDetailsCache.current[title] = book;
        setHoveredBook({ title, source, details: book });
      }
    } catch { /* silent */ }
  }

  async function navigateToBook(title: string) {
    if (bookDetailsCache.current[title]) {
      router.push(`/book/${bookDetailsCache.current[title].id}`);
      return;
    }
    try {
      const res = await booksApi.getAll(0, 1, title);
      const book = res.data.content?.[0];
      if (book) {
        bookDetailsCache.current[title] = book;
        router.push(`/book/${book.id}`);
      }
    } catch { /* silent */ }
  }

  // ── derived analytics ────────────────────────────────────────────────────────
  const a = analytics;
  const comp = a?.periodComparison;
  const orderStatusData = a
    ? Object.entries(a.ordersByStatus).map(([k, v]) => ({ name: STATUS_LABELS[k] ?? k, value: v, key: k }))
    : [];
  const salesData = a?.salesOverTime.map(d => {
    const [, month, day] = d.date.split("-");
    return { date: `${day}.${month}`, revenue: parseFloat(d.value) };
  }) ?? [];
  const hasDateFilter = PRESETS[preset].days !== 0 || (!!customStart && !!customEnd);

  const filteredCustomers = a
    ? a.customerMetrics.topCustomers.filter(c =>
        !customerSearch ||
        c.fullName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.username.toLowerCase().includes(customerSearch.toLowerCase()))
    : [];

  const filteredTopBooks = a
    ? a.topSellingBooks.filter(b =>
        !topBookSearch || b.title.toLowerCase().includes(topBookSearch.toLowerCase()))
    : [];

  const filteredSlowBooks = a
    ? a.slowMovingBooks.filter(b =>
        !slowBookSearch || b.title.toLowerCase().includes(slowBookSearch.toLowerCase()))
    : [];

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-2xl font-bold">Обзор</h1>

      {ioMessage && (
        <div className={`text-sm px-3 py-2 rounded-lg border ${ioMessage.ok ? "border-green-500 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300" : "border-red-500 text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300"}`}>
          {ioMessage.text}
        </div>
      )}

      {/* Catalog stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {catalogCards.map((card) => {
          const ioKey = card.key as CatalogEntity;
          return (
            <Link key={card.key} href={card.href}
              className="rounded-xl border bg-card p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <card.icon className={`h-8 w-8 ${card.color}`} />
                <span className="text-3xl font-bold">{catalogLoading ? "—" : stats[card.key]}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-4">{card.label}</p>
              <div className="mt-auto flex gap-2" onClick={e => e.preventDefault()}>
                <button disabled={ioLoading === ioKey} onClick={() => handleExport(ioKey)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs border hover:bg-muted transition-colors disabled:opacity-50">
                  <Download className="h-3.5 w-3.5" /> Экспорт
                </button>
                <button disabled={ioLoading === ioKey} onClick={() => fileInputRefs.current[ioKey]?.click()}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs border hover:bg-muted transition-colors disabled:opacity-50">
                  <Upload className="h-3.5 w-3.5" /> Импорт
                </button>
                <input type="file" accept=".json" className="hidden"
                  ref={el => { fileInputRefs.current[ioKey] = el; }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(ioKey, f); e.target.value = ""; }} />
              </div>
            </Link>
          );
        })}

        <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col">
          <Link href="/manager/orders" className="flex items-center justify-between mb-4">
            <ShoppingCart className="h-8 w-8 text-rose-500" />
            <span className="text-3xl font-bold">{catalogLoading ? "—" : stats.orders}</span>
          </Link>
          <p className="text-sm font-medium text-muted-foreground mb-4">Заказы</p>
          <div className="mt-auto">
            <button disabled={ordersExporting} onClick={handleExportOrders}
              className="w-full flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs border hover:bg-muted transition-colors disabled:opacity-50">
              <Download className="h-3.5 w-3.5" /> Экспорт
            </button>
          </div>
        </div>
      </div>

      {/* ── Analytics section ── */}
      <div className="space-y-6">
        {/* Period controls */}
        <div className="flex flex-wrap items-center gap-2">
          <SectionTitle>Аналитика</SectionTitle>
          <div className="flex-1" />
          <div className="flex gap-1 flex-wrap">
            {PRESETS.map((p, i) => (
              <button key={i} onClick={() => { setPreset(i); setShowCustom(false); }}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${preset === i && !showCustom ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>
                {p.label}
              </button>
            ))}
            <button onClick={() => setShowCustom(v => !v)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1 ${showCustom ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}>
              Период <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <button onClick={() => {
            const days = PRESETS[preset].days;
            if (days === 0) loadAnalytics();
            else {
              const end = new Date(); const start = new Date();
              start.setDate(end.getDate() - days);
              loadAnalytics(toDateStr(start), toDateStr(end));
            }
          }} className="p-1.5 rounded-lg border hover:bg-muted transition-colors" title="Обновить">
            <RefreshCw className={`h-4 w-4 ${analyticsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {showCustom && (
          <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl border bg-muted/30">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">С</label>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border bg-background" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">По</label>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border bg-background" />
            </div>
            <button onClick={applyCustom} disabled={!customStart || !customEnd}
              className="px-4 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground disabled:opacity-50 transition-opacity">
              Применить
            </button>
          </div>
        )}

        {analyticsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-5 h-24 animate-pulse bg-muted" />
            ))}
          </div>
        ) : a ? (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Выручка" value={`${fmt(a.summary.totalRevenue)} р.`}
                delta={comp?.totalRevenueDelta}
                sub={!hasDateFilter ? "за всё время" : undefined} />
              <KpiCard label="Заказов" value={fmtInt(a.summary.totalOrders)}
                delta={comp?.totalOrdersDelta}
                sub={!hasDateFilter ? "за всё время" : undefined} />
              <KpiCard label="Продано книг" value={fmtInt(a.summary.totalBooksSold)}
                delta={comp?.totalBooksSoldDelta} />
              <KpiCard label="Средний чек" value={`${fmt(a.summary.averageCheck)} р.`}
                delta={comp?.averageCheckDelta}
                sub={a.summary.avgDeliveryHours ? `Доставка: ${a.summary.avgDeliveryHours.toFixed(0)} ч` : undefined} />
            </div>

            {/* Row 2: Line chart + Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <ChartCard title="Выручка по дням" className="lg:col-span-3">
                {salesData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={salesData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                      <Tooltip
                        formatter={(v) => [`${fmt(Number(v))} р.`, "Выручка"]}
                        contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Статусы заказов" className="lg:col-span-2">
                {orderStatusData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                        dataKey="value" nameKey="name" paddingAngle={2}
                        style={{ cursor: "pointer" }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onClick={(entry: any) => router.push(`/manager/orders?status=${entry.key}`)}>
                        {orderStatusData.map((entry) => (
                          <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, name) => [Number(v), String(name)]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Row 3: Genre bar + Top customers */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <ChartCard title="Продажи по жанрам" className="lg:col-span-3">
                {a.salesByCategory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={a.salesByCategory} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v) => [Number(v), "Продано"]}
                        cursor={{ fill: "transparent" }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} style={{ cursor: "pointer" }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onClick={(entry: any) => router.push(`/manager/books?genre=${encodeURIComponent(entry.category)}`)}>
                        {a.salesByCategory.map((_, i) => (
                          <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Топ покупателей" className="lg:col-span-2">
                {a.customerMetrics.topCustomers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Нет данных</p>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                        placeholder="Поиск покупателя..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                      {customerSearch && (
                        <button onClick={() => setCustomerSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                      <span className="flex-1">Покупатель</span>
                      <span className="w-10 text-center">Заказов</span>
                      <span className="w-24 text-right">Сумма</span>
                    </div>
                    {filteredCustomers.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Не найдено</p>
                    ) : filteredCustomers.map((c, i) => (
                      <div key={c.username} className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/manager/orders?customer=${encodeURIComponent(c.fullName || c.username)}`)}>

                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{c.fullName || c.username}</p>
                          <p className="text-xs text-muted-foreground truncate">@{c.username}</p>
                        </div>
                        <span className="w-10 text-center text-sm font-semibold">{c.ordersCount}</span>
                        <span className="w-24 text-right text-sm font-semibold whitespace-nowrap">{fmt(c.totalSpent)} р.</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground text-right pt-1">
                      Всего уникальных: <span className="font-semibold text-foreground">{fmtInt(a.customerMetrics.uniqueCustomers)}</span>
                    </p>
                  </div>
                )}
              </ChartCard>
            </div>

            {/* Row 4: Top books + Slow movers + Returns + Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Top books */}
              <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-3">
                <SectionTitle>Топ книг</SectionTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input value={topBookSearch} onChange={e => setTopBookSearch(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  {topBookSearch && (
                    <button onClick={() => setTopBookSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {filteredTopBooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет данных</p>
                ) : (
                  <div className="space-y-1">
                    {filteredTopBooks.map((b, i) => (
                      <div key={i} className="relative group flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onMouseEnter={() => fetchBookDetails(b.title, "top")}
                        onMouseLeave={() => setHoveredBook(null)}
                        onClick={() => navigateToBook(b.title)}>
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        <p className="flex-1 text-sm truncate">{b.title}</p>
                        <span className="text-sm font-semibold text-emerald-600 shrink-0">{b.soldCount}</span>
                        {hoveredBook?.title === b.title && hoveredBook.source === "top" && hoveredBook.details && (
                          <div className="absolute z-20 left-0 bottom-full mb-1 w-56 rounded-xl border bg-popover shadow-lg p-3 space-y-1 pointer-events-none">
                            <p className="text-xs font-semibold line-clamp-2">{hoveredBook.details.title}</p>
                            <p className="text-xs text-muted-foreground">{hoveredBook.details.authors?.join(", ")}</p>
                            <div className="flex justify-between text-xs pt-1 border-t">
                              <span>Цена</span><span className="font-semibold">{fmt(hoveredBook.details.price)} р.</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Остаток</span>
                              <span className={`font-semibold ${(hoveredBook.details.stockQuantity ?? 0) === 0 ? "text-rose-500" : (hoveredBook.details.stockQuantity ?? 0) <= 5 ? "text-amber-500" : "text-emerald-600"}`}>
                                {hoveredBook.details.stockQuantity ?? "—"}
                              </span>
                            </div>
                            {hoveredBook.details.genres && hoveredBook.details.genres.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">{hoveredBook.details.genres.join(", ")}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slow movers */}
              <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-3">
                <SectionTitle>Аутсайдеры</SectionTitle>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input value={slowBookSearch} onChange={e => setSlowBookSearch(e.target.value)}
                    placeholder="Поиск..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  {slowBookSearch && (
                    <button onClick={() => setSlowBookSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                {filteredSlowBooks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет данных</p>
                ) : (
                  <div className="space-y-1">
                    {filteredSlowBooks.map((b, i) => (
                      <div key={i} className="relative group flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onMouseEnter={() => fetchBookDetails(b.title, "slow")}
                        onMouseLeave={() => setHoveredBook(null)}
                        onClick={() => navigateToBook(b.title)}>
                        <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                        <p className="flex-1 text-sm truncate">{b.title}</p>
                        <span className="text-sm font-semibold text-rose-500 shrink-0">{b.soldCount}</span>
                        {hoveredBook?.title === b.title && hoveredBook.source === "slow" && hoveredBook.details && (
                          <div className="absolute z-20 left-0 bottom-full mb-1 w-56 rounded-xl border bg-popover shadow-lg p-3 space-y-1 pointer-events-none">
                            <p className="text-xs font-semibold line-clamp-2">{hoveredBook.details.title}</p>
                            <p className="text-xs text-muted-foreground">{hoveredBook.details.authors?.join(", ")}</p>
                            <div className="flex justify-between text-xs pt-1 border-t">
                              <span>Цена</span><span className="font-semibold">{fmt(hoveredBook.details.price)} р.</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span>Остаток</span>
                              <span className={`font-semibold ${(hoveredBook.details.stockQuantity ?? 0) === 0 ? "text-rose-500" : (hoveredBook.details.stockQuantity ?? 0) <= 5 ? "text-amber-500" : "text-emerald-600"}`}>
                                {hoveredBook.details.stockQuantity ?? "—"}
                              </span>
                            </div>
                            {hoveredBook.details.genres && hoveredBook.details.genres.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">{hoveredBook.details.genres.join(", ")}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Returns */}
              <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-3">
                <SectionTitle>Возвраты</SectionTitle>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Clock className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{fmtInt(a.returnMetrics.returnRequested)}</p>
                      <p className="text-xs text-muted-foreground">Ожидают</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <RotateCcw className="h-4 w-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{fmtInt(a.returnMetrics.returned)}</p>
                      <p className="text-xs text-muted-foreground">Подтверждено</p>
                    </div>
                  </div>
                  <div className="pt-1 border-t">
                    <p className="text-xs text-muted-foreground">Сумма возвратов (всё время)</p>
                    <p className="text-lg font-bold text-rose-500">{fmt(a.returnMetrics.returnedRevenue)} р.</p>
                  </div>
                </div>
              </div>

              {/* Stock */}
              <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col gap-3">
                <SectionTitle>Склад</SectionTitle>
                {a.stockMetrics.outOfStockCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-600 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {a.stockMetrics.outOfStockCount} без остатка
                  </div>
                )}
                {a.stockMetrics.lowStockBooks.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm">
                    <Package className="h-4 w-4" />
                    Всё в норме
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground">Заканчивается:</p>
                    {a.stockMetrics.lowStockBooks.slice(0, 5).map((b, i) => (
                      <div key={i} className="flex items-center gap-2 cursor-pointer rounded-lg px-1 py-0.5 hover:bg-muted/50 transition-colors"
                        onClick={() => navigateToBook(b.title)}>
                        <span className={`w-6 text-center text-xs font-bold rounded px-1 ${b.stockQuantity === 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-950" : "bg-amber-100 text-amber-600 dark:bg-amber-950"}`}>
                          {b.stockQuantity}
                        </span>
                        <p className="flex-1 text-sm truncate" title={b.title}>{b.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground text-sm">
            Не удалось загрузить аналитику
          </div>
        )}
      </div>
    </div>
  );
}
