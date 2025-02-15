'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useCartStore } from '@/store/useCartStore';

export function AuthInitializer() {
  const { user, initializeFromCookies } = useUserStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    const initialize = async () => {
      await initializeFromCookies();
      
      // Nếu có user, fetch cart
      const currentUser = useUserStore.getState().user;
      if (currentUser?.jwt) {
        await fetchCart(currentUser.jwt);
      }
    };

    initialize();
  }, []);

  return null;
} 