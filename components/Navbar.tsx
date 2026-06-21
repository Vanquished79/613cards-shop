'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { ShoppingCart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export function Navbar() {
  const { items, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  
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
          <Image src="/logo.png" alt="613cards.com Logo" width={160} height={80} style={{ objectFit: 'contain', mixBlendMode: 'lighten' }} />
        </Link>
        <Link href="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
        <Link href="/contact" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Contact</Link>
        
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin/orders" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 500 }}>Admin</Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {session ? (
          <>
            <Link href="/account" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>My Account</Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '15px' }}>Logout</button>
          </>
        ) : (
          <Link href="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
        )}

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
            background: '#ff3333',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {itemCount}
          </span>
        )}
      </button>
      </div>
    </nav>
  );
}
