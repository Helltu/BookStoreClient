export type OrderStatus =
  | "NEW"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "FAILED";

export type DeliverySlot = "MORNING" | "AFTERNOON" | "EVENING";

export interface OrderItem {
  id: string;
  bookId: string;
  bookTitle: string;
  isbn: string;
  quantity: number;
  pricePerItem: number;
}

export interface DeliveryDetails {
  customerName: string;
  contactPhone: string;
  addressText: string;
  deliveryDate?: string;
  deliveryTimeSlot?: DeliverySlot;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  totalCost: number;
  deliveryDetails: DeliveryDetails;
  orderItems: OrderItem[];
  userEmail?: string;
}

export interface OrdersPage {
  content: Order[];
  totalPages: number;
  number: number;
  totalElements: number;
}

export interface OrderSearchParams {
  status?: OrderStatus;
  orderNumber?: string;
  customerName?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
