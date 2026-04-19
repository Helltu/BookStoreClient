import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  bookId: string;
  title: string;
  price: number;
  coverUrl?: string;
}

interface FavoriteStore {
  items: FavoriteItem[];
  addItem: (item: FavoriteItem) => void;
  removeItem: (bookId: string) => void;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.bookId === item.bookId)) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (bookId) =>
        set((state) => ({ items: state.items.filter((i) => i.bookId !== bookId) })),
      clearFavorites: () => set({ items: [] }),
    }),
    { name: 'favorite-storage' }
  )
);