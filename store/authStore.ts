import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CLIENT' | 'MANAGER' | null;

export interface User {
  id?: string;
  name: string;
  role: UserRole;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: (token, user) => {
        // Помимо сохранения в стор, сохраняем токен отдельно в localStorage, 
        // чтобы интерцептор axios мог к нему обращаться напрямую без десериализации всего состояния zustand
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }
        set({ token, user });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ token: null, user: null });
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'auth-storage', // имя для ключа в localStorage
    }
  )
);
