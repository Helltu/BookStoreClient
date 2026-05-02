"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search, ChevronUp, ChevronDown, ChevronsUpDown,
  Eye, CalendarDays, CheckCircle, XCircle, ArrowRight, Package,
} from "lucide-react";
import apiClient from "@/lib/api/axios";
import { BookItemCard } from "@/components/book-item-card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ManagerPagination } from "@/components/manager/manager-pagination";
import { ordersApi } from "@/lib/api/orders";
import type { Order, OrderStatus, DeliverySlot } from "@/lib/types/orders";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
  RETURN_REQUESTED: "Запрос возврата",
  RETURNED: "Возвращён",
  FAILED: "Доставка не удалась",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PROCESSING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
  RETURN_REQUESTED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  RETURNED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  NEW: "PROCESSING",
  SHIPPED: "DELIVERED",
};

const SLOT_LABELS: Record<DeliverySlot, string> = {
  MORNING: "Утро (9:00–13:00)",
  AFTERNOON: "День (13:00–18:00)",
  EVENING: "Вечер (18:00–22:00)",
};

const SLOT_END_HOUR: Record<DeliverySlot, number> = {
  MORNING: 13,
  AFTERNOON: 18,
  EVENING: 22,
};

function isSlotDisabled(slot: DeliverySlot, date: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (date !== today) return false;
  return new Date().getHours() >= SLOT_END_HOUR[slot] - 1;
}

type SortField = "orderNumber" | "status" | "createdAt" | "deliveryDate" | "totalPrice";
type SortDir = "asc" | "desc";

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
  return sortDir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function OrderItemCard({ item }: { item: { id: string; bookId: string; bookTitle: string; quantity: number; pricePerItem: number } }) {
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

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filterNumber, setFilterNumber] = useState("");
  const [filterCustomer, setFilterCustomer] = useState(() => searchParams.get("customer") ?? "");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "ALL">(() => {
    const s = searchParams.get("status");
    return (s as OrderStatus) ?? "ALL";
  });
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState<DeliverySlot>("MORNING");
  const [slotSaving, setSlotSaving] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (p: number, num?: string, customer?: string, status?: OrderStatus | "ALL", from?: string, to?: string) => {
    setLoading(true);
    const n = num ?? filterNumber;
    const c = customer ?? filterCustomer;
    const s = status ?? filterStatus;
    const f = from ?? filterFrom;
    const t = to ?? filterTo;
    try {
      const hasFilters = n || c || (s !== "ALL") || f || t;
      const res = hasFilters
        ? await ordersApi.search({ page: p, size: PAGE_SIZE, orderNumber: n || undefined, customerName: c || undefined, status: s !== "ALL" ? s : undefined, from: f || undefined, to: t || undefined })
        : await ordersApi.getAll(p, PAGE_SIZE);
      setOrders(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [filterNumber, filterCustomer, filterStatus, filterFrom, filterTo]);

  // debounce for text inputs
  useEffect(() => {
    const timer = setTimeout(() => { setPage(0); load(0, filterNumber, filterCustomer); }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterNumber, filterCustomer]);

  // immediate for selects/dates
  useEffect(() => {
    setPage(0);
    load(0, filterNumber, filterCustomer, filterStatus, filterFrom, filterTo);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterFrom, filterTo]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sorted = [...orders].sort((a, b) => {
    let cmp = 0;
    if (sortField === "orderNumber") cmp = a.orderNumber.localeCompare(b.orderNumber);
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    else if (sortField === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
    else if (sortField === "deliveryDate") cmp = (a.deliveryDetails?.deliveryDate ?? "").localeCompare(b.deliveryDetails?.deliveryDate ?? "");
    else if (sortField === "totalPrice") cmp = a.totalCost - b.totalCost;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const openDetail = async (order: Order) => {
    setSelectedOrder(order);
    setSheetOpen(true);
    try {
      const res = await ordersApi.getById(order.id);
      setSelectedOrder(res.data);
    } catch {
      // handled by interceptor
    }
  };

  const refreshSelected = async (id: string) => {
    try {
      const res = await ordersApi.getById(id);
      setSelectedOrder(res.data);
    } catch {
      // handled by interceptor
    }
    load(page);
  };

  const handleAdvanceStatus = async () => {
    if (!selectedOrder) return;
    setStatusSaving(true);
    try {
      if (["PROCESSING", "FAILED"].includes(selectedOrder.status)) {
        await ordersApi.ship(
          selectedOrder.id,
          selectedOrder.deliveryDetails.deliveryDate!,
          SLOT_LABELS[selectedOrder.deliveryDetails.deliveryTimeSlot as DeliverySlot],
        );
        toast.success(`Статус обновлён: ${STATUS_LABELS["SHIPPED"]}`);
      } else if (selectedOrder.status === "SHIPPED") {
        await ordersApi.updateStatus(selectedOrder.id, "FAILED");
        toast.success(`Статус обновлён: ${STATUS_LABELS["FAILED"]}`);
      } else {
        const next = NEXT_STATUS[selectedOrder.status];
        if (!next) return;
        await ordersApi.updateStatus(selectedOrder.id, next);
        toast.success(`Статус обновлён: ${STATUS_LABELS[next]}`);
      }
      setStatusDialogOpen(false);
      await refreshSelected(selectedOrder.id);
    } catch {
      // handled by interceptor
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSetSlot = async () => {
    if (!selectedOrder || !slotDate) return;
    setSlotSaving(true);
    try {
      await ordersApi.setDeliverySlot(selectedOrder.id, slotDate, SLOT_LABELS[slotTime]);
      toast.success("Доставка назначена");
      setSlotDialogOpen(false);
      await refreshSelected(selectedOrder.id);
    } catch {
      // handled by interceptor
    } finally {
      setSlotSaving(false);
    }
  };


  const handleCancel = async () => {
    if (!selectedOrder) return;
    try {
      await ordersApi.updateStatus(selectedOrder.id, "CANCELLED");
      toast.success("Заказ отменён");
      await refreshSelected(selectedOrder.id);
    } catch {
      // handled by interceptor
    }
  };

  const handleApproveReturn = async () => {
    if (!selectedOrder) return;
    try {
      await ordersApi.approveReturn(selectedOrder.id);
      toast.success("Возврат одобрен");
      await refreshSelected(selectedOrder.id);
    } catch {
      // handled by interceptor
    }
  };

  const handleRejectReturn = async () => {
    if (!selectedOrder) return;
    try {
      await ordersApi.rejectReturn(selectedOrder.id);
      toast.success("Возврат отклонён");
      await refreshSelected(selectedOrder.id);
    } catch {
      // handled by interceptor
    }
  };

  const openSlotDialog = () => {
    const date = selectedOrder?.deliveryDetails?.deliveryDate ?? "";
    const existingSlot = selectedOrder?.deliveryDetails?.deliveryTimeSlot ?? "MORNING";
    const firstAvailable = (["MORNING", "AFTERNOON", "EVENING"] as DeliverySlot[]).find((s) => !isSlotDisabled(s, date)) ?? "MORNING";
    setSlotDate(date);
    setSlotTime(isSlotDisabled(existingSlot, date) ? firstAvailable : existingSlot);
    setSlotDialogOpen(true);
  };

  const thClass = "cursor-pointer select-none hover:bg-muted/50 transition-colors";

  const hasActions = selectedOrder && (
    ["NEW", "PROCESSING", "SHIPPED", "FAILED", "RETURN_REQUESTED"].includes(selectedOrder.status)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Заказы</h1>
          {!loading && <p className="text-sm text-muted-foreground mt-0.5">Всего: {totalElements}</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Номер заказа..."
            value={filterNumber}
            onChange={(e) => setFilterNumber(e.target.value)}
            className="pl-9 w-48"
          />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Получатель..."
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="pl-9 w-48"
          />
        </div>

        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as OrderStatus | "ALL")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все статусы</SelectItem>
            {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-40" title="Дата от" />
          <span className="text-muted-foreground text-sm">—</span>
          <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-40" title="Дата до" />
        </div>

        {(filterNumber || filterCustomer || filterStatus !== "ALL" || filterFrom || filterTo) && (
          <Button variant="ghost" onClick={() => { setFilterNumber(""); setFilterCustomer(""); setFilterStatus("ALL"); setFilterFrom(""); setFilterTo(""); }}>
            Сбросить
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Заказы не найдены</div>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div ref={tableRef} className="rounded-lg border overflow-auto flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={thClass} onClick={() => toggleSort("orderNumber")}>
                    <span className="flex items-center">№ заказа <SortIcon field="orderNumber" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className={thClass} onClick={() => toggleSort("status")}>
                    <span className="flex items-center">Статус <SortIcon field="status" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Получатель</TableHead>
                  <TableHead className={`hidden lg:table-cell ${thClass}`} onClick={() => toggleSort("createdAt")}>
                    <span className="flex items-center">Оформлен <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className={`hidden xl:table-cell ${thClass}`} onClick={() => toggleSort("deliveryDate")}>
                    <span className="flex items-center">Доставка <SortIcon field="deliveryDate" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className={`text-right ${thClass}`} onClick={() => toggleSort("totalPrice")}>
                    <span className="flex items-center justify-end">Сумма <SortIcon field="totalPrice" sortField={sortField} sortDir={sortDir} /></span>
                  </TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-muted/40" onClick={() => openDetail(order)}>
                    <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                    <TableCell><StatusBadge status={order.status} /></TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{order.deliveryDetails?.customerName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{order.deliveryDetails?.deliveryDate ? formatDate(order.deliveryDetails.deliveryDate) : "—"}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{order.totalCost.toLocaleString("ru-RU")} ₽</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDetail(order); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ManagerPagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); load(p); }} tableRef={tableRef} />
        </div>
      )}

      {/* Order detail sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
          {selectedOrder && (
            <>
              <SheetHeader className="px-5 pt-5 pb-4 border-b shrink-0">
                <SheetTitle className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-mono">{selectedOrder.orderNumber}</span>
                  <StatusBadge status={selectedOrder.status} />
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-5 px-5 py-5" style={{ paddingBottom: hasActions ? "5rem" : "1.25rem" }}>
                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Создан</p>
                      <p className="font-medium">{formatDateTime(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Сумма</p>
                      <p className="font-medium">{selectedOrder.totalCost.toLocaleString("ru-RU")} ₽</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Получатель</p>
                      <p className="font-medium">{selectedOrder.deliveryDetails.customerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Телефон</p>
                      <p className="font-medium">{selectedOrder.deliveryDetails.contactPhone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Адрес</p>
                      <p className="font-medium">{selectedOrder.deliveryDetails.addressText}</p>
                    </div>
                    {selectedOrder.userEmail && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Email клиента</p>
                        <p className="font-medium">{selectedOrder.userEmail}</p>
                      </div>
                    )}
                    {selectedOrder.deliveryDetails.deliveryDate && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Доставка</p>
                        <p className="font-medium">
                          {formatDate(selectedOrder.deliveryDetails.deliveryDate)}
                          {selectedOrder.deliveryDetails.deliveryTimeSlot && ` · ${SLOT_LABELS[selectedOrder.deliveryDetails.deliveryTimeSlot]}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Items */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Состав заказа</h3>
                    <div className="flex flex-col gap-3">
                      {selectedOrder.orderItems?.map((item) => (
                        <OrderItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions pinned to bottom */}
              {hasActions && (
                <div className="absolute bottom-0 left-0 right-0 border-t bg-background px-5 py-4 flex flex-col gap-2">
                  {/* NEW → PROCESSING */}
                  {NEXT_STATUS[selectedOrder.status] && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setStatusDialogOpen(true)}
                      disabled={
                        NEXT_STATUS[selectedOrder.status] === "DELIVERED" &&
                        (!selectedOrder.deliveryDetails?.deliveryDate || !selectedOrder.deliveryDetails?.deliveryTimeSlot)
                      }
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Перевести в «{STATUS_LABELS[NEXT_STATUS[selectedOrder.status]!]}»
                    </Button>
                  )}
                  {/* PROCESSING → SHIPPED, FAILED → SHIPPED (через /ship) */}
                  {["PROCESSING", "FAILED"].includes(selectedOrder.status) && (
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      onClick={() => setStatusDialogOpen(true)}
                      disabled={!selectedOrder.deliveryDetails?.deliveryDate || !selectedOrder.deliveryDetails?.deliveryTimeSlot}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Перевести в «{STATUS_LABELS["SHIPPED"]}»
                    </Button>
                  )}
                  {/* SHIPPED → FAILED */}
                  {selectedOrder.status === "SHIPPED" && (
                    <Button className="w-full justify-start" variant="outline" onClick={() => setStatusDialogOpen(true)}>
                      <XCircle className="h-4 w-4 mr-2 text-destructive" />
                      Отметить как «{STATUS_LABELS["FAILED"]}»
                    </Button>
                  )}
                  {/* Отмена */}
                  {["NEW", "PROCESSING", "FAILED"].includes(selectedOrder.status) && (
                    <Button className="w-full justify-start" variant="outline" onClick={handleCancel}>
                      <XCircle className="h-4 w-4 mr-2 text-destructive" />
                      Отменить заказ
                    </Button>
                  )}
                  {/* Назначить/изменить доставку */}
                  {["NEW", "PROCESSING", "SHIPPED", "FAILED"].includes(selectedOrder.status) && (
                    <Button className="w-full justify-start" variant="outline" onClick={openSlotDialog}>
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {selectedOrder.deliveryDetails.deliveryDate ? "Изменить доставку" : "Назначить доставку"}
                    </Button>
                  )}
                  {selectedOrder.status === "RETURN_REQUESTED" && (
                    <>
                      <Button className="w-full justify-start" variant="outline" onClick={handleApproveReturn}>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Одобрить возврат
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={handleRejectReturn}>
                        <XCircle className="h-4 w-4 mr-2 text-destructive" />
                        Отклонить возврат
                      </Button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Advance status dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить статус заказа?</DialogTitle>
          </DialogHeader>
          {selectedOrder && NEXT_STATUS[selectedOrder.status] && (
            <p className="text-sm text-muted-foreground">
              Заказ <span className="font-mono font-medium">#{selectedOrder.orderNumber}</span> будет переведён из{" "}
              <strong>{STATUS_LABELS[selectedOrder.status]}</strong> в{" "}
              <strong>{STATUS_LABELS[NEXT_STATUS[selectedOrder.status]!]}</strong>.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleAdvanceStatus} disabled={statusSaving}>
              {statusSaving ? "Сохранение..." : "Подтвердить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery slot dialog */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Назначить доставку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="slot-date">Дата доставки</Label>
              <Input
                id="slot-date"
                type="date"
                value={slotDate}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setSlotDate(newDate);
                  if (isSlotDisabled(slotTime, newDate)) {
                    const first = (["MORNING", "AFTERNOON", "EVENING"] as DeliverySlot[]).find((s) => !isSlotDisabled(s, newDate));
                    if (first) setSlotTime(first);
                  }
                }}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="space-y-2">
              <Label>Временной слот</Label>
              <Select value={slotTime} onValueChange={(v) => setSlotTime(v as DeliverySlot)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SLOT_LABELS) as DeliverySlot[]).map((s) => (
                    <SelectItem key={s} value={s} disabled={isSlotDisabled(s, slotDate)}>{SLOT_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotDialogOpen(false)}>Отмена</Button>
            <Button onClick={handleSetSlot} disabled={slotSaving || !slotDate}>
              {slotSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
