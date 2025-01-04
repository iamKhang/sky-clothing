import {create} from 'zustand';
import axios from 'axios';

interface ProductVariant {
  variantId: string;
  sku: string;
  color: string;
  size: string;
  quantity: number;
  discountPercentage: number;
  productImages: string[];
}

interface CartItem {
  cartItemId: string;
  productVariant: ProductVariant;
  quantity: number;
}

interface Cart {
  cartId: string;
  userId: string;
  cartItems: CartItem[];
}

interface CartState {
  cart: Cart | null;
  fetchCart: (jwt: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  fetchCart: async (jwt) => {
    try {
      const response = await axios.get('http://localhost:8080/api/cart/get', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      set({ cart: response.data });
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  },
  clearCart: () => set({ cart: null }),
}));