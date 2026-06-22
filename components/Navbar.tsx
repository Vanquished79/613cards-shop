'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { ShoppingCart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function Navbar({ categories = [] }: { categories?: any[] }) {
  const { items, setIsCartOpen } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const topLevelCategories = categories.filter((c: any) => !c.parentId);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q') as string;
    if (q) {
      router.push(`/?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, width: '100%', borderBottom: '1px solid var(--glass-border)' }}>
      <nav className="navbar-container">
        {/* Left: Prominent Logo */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', background: 'transparent' }}>
            <Image src="/logo.png" alt="613cards.com Logo" width={300} height={150} className="navbar-logo" style={{ objectFit: 'contain', mixBlendMode: 'lighten', backgroundColor: 'transparent' }} priority />
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

      {/* Sub Nav: Categories and Search */}
      <div style={{ background: 'rgba(10, 6, 20, 0.95)', padding: '12px 40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--glass-border)' }}>
        
        {/* Left Spacer */}
        <div style={{ flex: 1 }} className="subnav-spacer" />

        {/* Center: Categories */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center' }}>
          <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>All Categories</Link>
          {topLevelCategories.map((c: any) => {
            const children = categories.filter((sub: any) => sub.parentId === c.id);
            
            if (children.length > 0) {
              return (
                <div 
                  key={c.id} 
                  style={{ position: 'relative', display: 'inline-block', paddingBottom: '8px' }}
                  onMouseEnter={() => setHoveredCategory(c.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link href={`/?categoryId=${c.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', padding: '12px 0' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {c.name} ▾
                  </Link>
                  {hoveredCategory === c.id && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, background: 'rgba(26, 11, 46, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px 0', minWidth: '180px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 50 }}>
                      {children.map((sub: any) => (
                        <Link key={sub.id} href={`/?categoryId=${sub.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', padding: '8px 16px', transition: 'background 0.2s, color 0.2s' }}
                              onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={c.id} style={{ paddingBottom: '8px' }}>
                <Link href={`/?categoryId=${c.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  {c.name}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right: Search */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', minWidth: '250px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', maxWidth: '300px' }}>
            <input 
              type="text" 
              name="q" 
              placeholder="Search all cards..." 
              style={{ 
                width: '100%', 
                padding: '8px 16px 8px 36px', 
                borderRadius: '20px', 
                border: '1px solid var(--glass-border)', 
                background: 'rgba(0,0,0,0.2)', 
                color: 'white', 
                outline: 'none',
                fontSize: '14px'
              }} 
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
          </form>
        </div>
      </div>
    </header>
  );
}
