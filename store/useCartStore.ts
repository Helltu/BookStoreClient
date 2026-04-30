import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  bookId: string;
  title: string;
  price: number;
  coverUrl?: string;
  quantity: number;
  authors?: string[];
  averageRating?: number;
  totalReviews?: number;
  stockQuantity?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  updateStockQuantity: (bookId: string, stockQuantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.bookId === newItem.bookId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                  item.bookId === newItem.bookId ? { ...item, quantity: Math.min(9, item.quantity + 1) } : item
              ),
            };
          }
          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        });
      },
      updateStockQuantity: (bookId, stockQuantity) => {
        set((state) => ({
          items: state.items.map((item) => item.bookId === bookId ? { ...item, stockQuantity } : item),
        }));
      },
      removeItem: (bookId) => {
        set((state) => ({ items: state.items.filter((item) => item.bookId !== bookId) }));
      },
      updateQuantity: (bookId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => (item.bookId === bookId ? { ...item, quantity: Math.max(1, Math.min(9, quantity)) } : item)),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: 'cart-storage' }
  )
);