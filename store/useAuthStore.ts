import { create } from 'zustand';
import apiClient from '@/lib/api/axios';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'CLIENT' | 'MANAGER';
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: (token: string) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true });
    // Сразу запрашиваем профиль после установки токена
    useAuthStore.getState().fetchProfile();
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  
  fetchProfile: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }
      const res = await apiClient.get('/users/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));