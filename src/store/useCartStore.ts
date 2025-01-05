import { create } from 'zustand';
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
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
}

const getCartFromLocalStorage = () => {
  const cart = localStorage.getItem('cart');
  return cart ? JSON.parse(cart) : null;
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
      localStorage.setItem('cart', JSON.stringify(response.data));
      set({ cart: response.data });
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  },
  clearCart: () => {
    localStorage.removeItem('cart');
    set({ cart: null });
  },
  updateQuantity: (itemId, quantity) => {
    set((state) => {
      if (!state.cart) return state;
      const updatedCartItems = state.cart.cartItems.map((item) =>
        item.cartItemId === itemId ? { ...item, quantity } : item
      );
      const updatedCart = { ...state.cart, cartItems: updatedCartItems };
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
  },
  removeItem: (itemId) => {
    set((state) => {
      if (!state.cart) return state;
      const updatedCartItems = state.cart.cartItems.filter(
        (item) => item.cartItemId !== itemId
      );
      const updatedCart = { ...state.cart, cartItems: updatedCartItems };
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      return { cart: updatedCart };
    });
  },
}));