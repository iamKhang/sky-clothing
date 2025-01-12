import { create } from 'zustand';
import { getCookies, clearCookies } from '@/app/actions/auth';

interface User {
  email: string;
  jwt: string;
  fullName: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => Promise<void>;
  initializeFromCookies: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  
  setUser: (user) => {
    set({ user });
  },
  
  clearUser: async () => {
    await clearCookies();
    set({ user: null });
  },
  
  initializeFromCookies: async () => {
    const { token, fullName } = await getCookies();
    
    if (token && fullName) {
      set({
        user: {
          jwt: token,
          fullName: fullName,
          email: '' // Email sẽ được lấy từ decoded JWT nếu cần
        }
      });
    }
  }
}));