import { create } from 'zustand';
import axios from 'axios';
import { useUserStore } from './useUserStore';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Size {
  sizeId: string;
  sku: string;
  size: string;
  quantity: number;
  soldQuantity: number;
  discountPercentage: number;
  active: boolean;
  newProduct: boolean;
  bestSeller: boolean;
}

interface CartItem {
  cartItemId: string;
  productName: string;
  size: Size;
  quantity: number;
  itemTotal: number;
  color: string;
  productImage: string;
}

interface Cart {
  cartId: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
}

interface CartState {
  cart: Cart | null;
  fetchCart: (jwt: string) => Promise<void>;
  clearCart: () => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
}

const getCartFromLocalStorage = () => {
  try {
    const cartStr = localStorage.getItem('cart');
    if (!cartStr) return null;

    // Kiểm tra user có đăng nhập không
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      localStorage.removeItem('cart');
      return null;
    }

    const user = JSON.parse(userStr);
    if (!user.jwt) {
      localStorage.removeItem('cart');
      return null;
    }

    return JSON.parse(cartStr);
  } catch (error) {
    localStorage.removeItem('cart');
    console.log(error)
    return null;
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      fetchCart: async (jwt) => {
        if (!jwt) {
          set({ cart: null });
          return;
        }

        try {
          const response = await axios.get('http://localhost:8080/api/cart/get', {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          
          if (response.data) {
            localStorage.setItem('cart-data', JSON.stringify(response.data));
            set({ cart: response.data });
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
          if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            localStorage.removeItem('cart-data');
            const { clearUser } = useUserStore.getState();
            await clearUser();
          }
          set({ cart: null });
        }
      },
      clearCart: () => {
        localStorage.removeItem('cart-data');
        set({ cart: null });
      },
      updateQuantity: async (itemId, quantity) => {
        try {
          const user = useUserStore.getState().user;
          if (!user?.jwt) {
            throw new Error('User not authenticated');
          }

          await axios.put(
            `http://localhost:8080/api/cart/update-quantity/${itemId}`,
            { quantity },
            {
              headers: {
                Authorization: `Bearer ${user.jwt}`,
              },
            }
          );

          await useCartStore.getState().fetchCart(user.jwt);
        } catch (error) {
          console.error('Error updating quantity:', error);
          if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            localStorage.removeItem('cart-data');
            const { clearUser } = useUserStore.getState();
            await clearUser();
          }
        }
      },
      removeItem: async (itemId) => {
        try {
          const user = useUserStore.getState().user;
          if (!user?.jwt) {
            throw new Error('User not authenticated');
          }

          await axios.delete(`http://localhost:8080/api/cart/remove/${itemId}`, {
            headers: {
              Authorization: `Bearer ${user.jwt}`,
            },
          });

          await useCartStore.getState().fetchCart(user.jwt);
        } catch (error) {
          console.error('Error removing item:', error);
          if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            localStorage.removeItem('cart-data');
            const { clearUser } = useUserStore.getState();
            await clearUser();
          }
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart })
    }
  )
);