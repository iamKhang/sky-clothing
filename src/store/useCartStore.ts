import { create } from 'zustand';
import axios from 'axios';
import { useUserStore } from './useUserStore';

interface ProductVariant {
  variantId: string;
  productName: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
  productImages: string[];
}

interface CartItem {
  cartItemId: string;
  variant: ProductVariant;
  quantity: number;
  itemTotal: number;
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

export const useCartStore = create<CartState>((set) => ({
  cart: getCartFromLocalStorage(),
  fetchCart: async (jwt) => {
    try {
      const response = await axios.get('http://localhost:8080/api/cart/get', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      // Lưu cart vào localStorage
      localStorage.setItem('cart', JSON.stringify(response.data));
      set({ cart: response.data });
    } catch (error) {
      console.error('Error fetching cart:', error);
      localStorage.removeItem('cart');
      set({ cart: null });
    }
  },
  clearCart: () => {
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

      // Fetch lại cart và cập nhật localStorage
      await useCartStore.getState().fetchCart(user.jwt);
    } catch (error) {
      console.error('Error updating quantity:', error);
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

      // Fetch lại cart và cập nhật localStorage
      await useCartStore.getState().fetchCart(user.jwt);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  },
}));