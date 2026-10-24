import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Cart, CartItem } from '../types';
import * as api from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  getItemForProduct: (productId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getCart();
      if (res.success && res.data) setCart(res.data.cart);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    await api.addToCart(productId, quantity);
    await refreshCart();
  }, [refreshCart]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    await api.updateCartItem(itemId, quantity);
    await refreshCart();
  }, [refreshCart]);

  const removeItem = useCallback(async (itemId: string) => {
    await api.removeCartItem(itemId);
    await refreshCart();
  }, [refreshCart]);

  const getItemForProduct = useCallback((productId: string): CartItem | undefined => {
    return cart?.items.find((item) => item.product._id === productId);
  }, [cart]);

  const itemCount = cart?.itemCount ?? 0;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, addToCart, updateItem, removeItem, refreshCart, getItemForProduct }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
