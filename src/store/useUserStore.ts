import { create } from 'zustand';

interface UserState {
  user: { email: string; jwt: string; fullName: string } | null;
  setUser: (user: { email: string; jwt: string; fullName: string }) => void;
  clearUser: () => void;
}

// Thêm event listener để xóa data khi đóng tab
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  });
}

const getUserFromLocalStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    // Kiểm tra JWT có tồn tại không
    if (!user.jwt) {
      localStorage.removeItem('user');
      return null;
    }
    
    return user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

export const useUserStore = create<UserState>((set) => ({
  user: getUserFromLocalStorage(),
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart'); // Xóa cả cart khi logout
    set({ user: null });
  },
}));