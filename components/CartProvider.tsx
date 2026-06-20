'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Load from local storage
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));

    let sid = localStorage.getItem('cartSessionId');
    if (!sid) {
      sid = generateId();
      localStorage.setItem('cartSessionId', sid);
    }
    setSessionId(sid);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isMounted]);

  const syncWithServer = async (newItems: CartItem[]) => {
    if (!sessionId) return newItems;
    
    try {
      const res = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, items: newItems })
      });
      const data = await res.json();
      if (data.items) {
        setItems(data.items); // Update with server's authorized inventory limits
        return data.items;
      }
    } catch (e) {
      console.error(e);
    }
    return newItems;
  };

  const addToCart = async (product: any) => {
    let newItems = [...items];
    const existing = newItems.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      newItems.push({ id: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl });
    }
    
    const syncedItems = await syncWithServer(newItems);
    
    // Check if the item was successfully added/increased
    const syncedExisting = syncedItems.find((i) => i.id === product.id);
    if (!syncedExisting || (existing && syncedExisting.quantity === existing.quantity - 1)) {
      alert('Sorry, that item is out of stock or currently in another user\'s cart.');
    } else {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = async (id: number) => {
    const newItems = items.filter((i) => i.id !== id);
    setItems(newItems); // Optimistic UI
    await syncWithServer(newItems);
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return removeFromCart(id);
    const newItems = items.map((i) => (i.id === id ? { ...i, quantity } : i));
    // Optimistic UI update (sync might revert it if out of stock)
    setItems(newItems);
    await syncWithServer(newItems);
  };

  const clearCart = async () => {
    setItems([]);
    await syncWithServer([]);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
}
