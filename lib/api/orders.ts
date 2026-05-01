import apiClient from './axios';
import type { Order, OrdersPage, OrderStatus, DeliverySlot, OrderSearchParams } from '../types/orders';

export const ordersApi = {
  getAll: (page: number, size: number) =>
    apiClient.get<OrdersPage>('/orders', { params: { page, size } }),

  search: (params: OrderSearchParams) => {
    const p = { ...params };
    if (p.from) p.from = `${p.from}T00:00:00`;
    if (p.to) p.to = `${p.to}T23:59:59`;
    return apiClient.get<OrdersPage>('/orders/search', { params: p });
  },

  getById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<void>(`/orders/${id}/status`, { status }),

  setDeliverySlot: (id: string, deliveryDate: string, timeSlot: string) =>
    apiClient.patch<void>(`/orders/${id}/delivery-slot`, { deliveryDate, timeSlot }),

  approveReturn: (id: string) =>
    apiClient.patch<void>(`/orders/${id}/return-approve`),

  rejectReturn: (id: string) =>
    apiClient.patch<void>(`/orders/${id}/return-reject`),

  export: () =>
    apiClient.get('/orders/export', { responseType: 'blob' }),
};
