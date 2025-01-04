// filepath: /e:/sky-clothing/src/store/useUserStore.ts
import {create} from 'zustand';

interface UserState {
  user: { email: string; jwt: string } | null;
  setUser: (user: { email: string; jwt: string }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));