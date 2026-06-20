'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { ShoppingCart } from 'lucide-react';

export function Navbar() {
  const { items, setIsCartOpen } = useCart();
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 40px', 
      background: 'rgba(26, 11, 46, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <Link href="/">
          <Image src="/logo.png" alt="613cards.com Logo" width={100} height={50} style={{ objectFit: 'contain' }} />
        </Link>
        <Link href="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
        <Link href="/shop" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Shop</Link>
        <Link href="/contact" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Contact</Link>
      </div>

      <button 
        onClick={() => setIsCartOpen(true)}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'white', 
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ShoppingCart size={28} />
        {itemCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'var(--accent-color)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {itemCount}
          </span>
        )}
      </button>
    </nav>
  );
}
