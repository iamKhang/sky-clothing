import { create } from 'zustand';
import { getCookies, clearCookies } from '@/app/actions/auth';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';

interface User {
  email: string;
  jwt: string;
  fullName: string;
}

interface UserState {
  user: User | null;
  isInitialized: boolean;
  setUser: (user: User) => void;
  clearUser: () => Promise<void>;
  initializeFromCookies: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isInitialized: false,
      
      setUser: (user) => {
        if (user) {
          localStorage.setItem('user-data', JSON.stringify({
            jwt: user.jwt,
            fullName: user.fullName,
            email: user.email
          }));
        }
        set({ user, isInitialized: true });
      },
      
      clearUser: async () => {
        await clearCookies();
        localStorage.removeItem('user-data');
        localStorage.removeItem('cart-storage');
        set({ user: null, isInitialized: true });
      },
      
      initializeFromCookies: async () => {
        try {
          // Thử lấy từ localStorage trước
          const savedUserData = localStorage.getItem('user-data');
          if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            try {
              await axios.post('http://localhost:8080/api/auth/validate', null, {
                headers: {
                  'Authorization': `Bearer ${userData.jwt}`
                }
              });
              
              set({
                user: userData,
                isInitialized: true
              });
              return;
            } catch (error) {
              console.error('Error validating saved token:', error);
              if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
                localStorage.removeItem('user-data');
                localStorage.removeItem('cart-storage');
              }
            }
          }

          // Nếu không có trong localStorage hoặc token không hợp lệ, thử lấy từ cookies
          const { token, fullName } = await getCookies();
          
          if (token && fullName) {
            try {
              await axios.post('http://localhost:8080/api/auth/validate', null, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              const userData = {
                jwt: token,
                fullName: fullName,
                email: ''
              };
              
              localStorage.setItem('user-data', JSON.stringify(userData));
              set({
                user: userData,
                isInitialized: true
              });
            } catch (error) {
              console.error('Error validating token:', error);
              if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
                await clearCookies();
                localStorage.removeItem('user-data');
                localStorage.removeItem('cart-storage');
              }
              set({ user: null, isInitialized: true });
            }
          } else {
            set({ user: null, isInitialized: true });
          }
        } catch (error) {
          console.error('Error initializing user:', error);
          set({ user: null, isInitialized: true });
        }
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user })
    }
  )
);