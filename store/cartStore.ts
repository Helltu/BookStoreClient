import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.bookId === item.bookId);
          
          if (existingItem) {
            // Если товар уже есть, увеличиваем количество
            return {
              items: state.items.map((i) =>
                i.bookId === item.bookId
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            };
          }
          
          // Если товара нет, добавляем с количеством 1 (или указанным)
          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          };
        });
      },

      removeFromCart: (bookId) => {
        set((state) => ({
          items: state.items.filter((item) => item.bookId !== bookId),
        }));
      },

      updateQuantity: (bookId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
             return { items: state.items.filter((i) => i.bookId !== bookId) };
          }
          return {
            items: state.items.map((i) =>
              i.bookId === bookId ? { ...i, quantity } : i
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage', // имя для ключа в localStorage
    }
  )
);
