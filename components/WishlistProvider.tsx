'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistContextType {
  wishlistIds: Set<number>;
  toggleWishlist: (productId: number) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/wishlist/ids')
        .then(res => res.json())
        .then(data => {
          if (data.wishlistIds) {
            setWishlistIds(new Set(data.wishlistIds));
          }
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    } else {
      setWishlistIds(new Set());
      setIsLoading(false);
    }
  }, [session]);

  const toggleWishlist = async (productId: number) => {
    if (!session?.user) {
      alert("Please log in to use the wishlist.");
      return;
    }

    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to toggle wishlist');
      }
    } catch (error: any) {
      // Revert optimistic update
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });
      alert(error.message || "An error occurred updating your wishlist.");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
