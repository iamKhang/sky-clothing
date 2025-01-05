import { create } from 'zustand';

interface UserState {
  user: { email: string; jwt: string } | null;
  setUser: (user: { email: string; jwt: string }) => void;
  clearUser: () => void;
}

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const useUserStore = create<UserState>((set) => ({
  user: getUserFromLocalStorage(),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));