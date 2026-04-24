import { useState, useCallback } from 'react';
import type { Medicine } from '../lib/types';

export interface CartItem extends Medicine {
  quantity: number;
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItem = useCallback((medicine: Medicine) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item._id === medicine._id);
      if (existing) {
        if (existing.quantity >= medicine.stock) return prev;
        return prev.map((item) =>
          item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item;
          if (newQty > item.stock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const total = cartItems.reduce((acc, item) => acc + item.sellingPrice * item.quantity, 0);

  return {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    total,
  };
}
