'use client'

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useCartStore } from '@/store/useCartStore';
import { authService } from '@/services/authService';

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initializeFromCookies = useUserStore((state) => state.initializeFromCookies);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const initialize = async () => {
      await initializeFromCookies();
      const token = await authService.getToken();
      
      if (token) {
        await fetchCart(token);
        
        // Setup token refresh
        const refreshInterval = setInterval(async () => {
          const response = await authService.validateToken();
          if (response) {
            setUser({ email: '', ...response });
            await fetchCart(response.jwt);
          }
        }, TOKEN_REFRESH_INTERVAL);
        
        return () => clearInterval(refreshInterval);
      }
    };

    initialize();
  }, [initializeFromCookies, fetchCart, setUser]);

  return <>{children}</>;
} 