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
    <nav className="navbar-container">
      {/* Left: Prominent Logo */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <Image src="/logo.png" alt="613cards.com Logo" width={300} height={150} className="navbar-logo" style={{ objectFit: 'contain', mixBlendMode: 'lighten' }} priority />
        </Link>
      </div>

      {/* Center: Navigation Links */}
      <div className="nav-links" style={{ flex: 1 }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Shop</Link>
        <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          Contact
        </Link>
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin/orders" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 600, fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</Link>
        )}
      </div>

      {/* Right: Account & Cart */}
      <div className="navbar-right" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '32px', alignItems: 'center' }}>
        {session ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/account" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              My Account
            </Link>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '14px', padding: '8px 24px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            Login
          </Link>
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
            justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <ShoppingCart size={28} />
          {itemCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-10px',
              background: '#ff3366',
              color: 'white',
              fontSize: '13px',
              fontWeight: 'bold',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(255,51,102,0.6)'
            }}>
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
