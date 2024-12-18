import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@firebase/auth-types';

interface AuthState {
  user: User | null;
  tokens: number;
  setUser: (user: User | null) => void;
  setTokens: (tokens: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: 0,
      setUser: (user) => set({ user }),
      setTokens: (tokens) => set({ tokens }),
      clearAuth: () => set({ user: null, tokens: 0 }),
    }),
    {
      name: 'auth-storage',
    }
  )
);