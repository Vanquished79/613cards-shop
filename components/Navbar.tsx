'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { ShoppingCart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import logoImg from '../public/logo.png';

import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useCurrency } from './CurrencyProvider';

export function Navbar({ categories = [] }: { categories?: any[] }) {
  const { items, setIsCartOpen } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { data: session } = useSession();
  const router = useRouter();
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  
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
    <header style={{ position: 'sticky', top: 0, zIndex: 30, width: '100%', borderBottom: 'var(--border-width) solid var(--glass-border)', background: 'var(--glass-bg)' }}>
      {/* Top Main Row */}
      <div className="navbar-top-row">
        
        {/* Left: Logo */}
        <div className="navbar-logo-container" style={{ width: '240px', height: '120px', display: 'flex', alignItems: 'center' }}>
          <Link href="/" className="navbar-logo-link" style={{ position: 'static', textDecoration: 'none', width: '100%', height: '100%' }}>
            <img src="/shield-logo-transparent.png" alt="613cards Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Link>
        </div>

        {/* Center: Global Search Bar */}
        <div className="navbar-search-container">
          <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', maxWidth: '600px', position: 'relative' }}>
            <input 
              type="text" 
              name="q" 
              placeholder="Search for cards, sealed products, or supplies..." 
              style={{ 
                width: '100%', 
                padding: '12px 24px 12px 48px', 
                borderRadius: '30px', 
                border: 'var(--border-width) solid var(--glass-border)', 
                background: 'var(--bg-color-start)', 
                color: 'var(--text-main)', 
                outline: 'none',
                fontSize: '15px',
                transition: 'box-shadow 0.2s',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }} 
              onFocus={(e) => { e.target.style.boxShadow = 'var(--glass-glow)'; }}
              onBlur={(e) => { e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.05)'; }}
            />
            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-accent)' }} />
            <button type="submit" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'var(--accent-color)', color: '#1a1025', border: 'none', borderRadius: '20px', padding: '6px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>

        {/* Right: Currency, Account, Cart */}
        <div className="navbar-right-container">
          
          {/* Currency Selector (Custom Dropdown) */}
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
              style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--text-main)', 
              fontSize: '14px', 
              fontWeight: 700, 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'var(--border-width) solid var(--glass-border)',
              background: 'var(--bg-color-start)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.boxShadow = '2px 2px 0px var(--glass-border)'; }}
            onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span>{currency}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </div>
            
            {isCurrencyOpen && (
              <>
                <div 
                  onClick={() => setIsCurrencyOpen(false)} 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }}
                />
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  marginTop: '8px',
                  background: 'rgba(26, 11, 46, 0.98)', 
                  backdropFilter: 'blur(16px)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', 
                  padding: '8px 0', 
                  minWidth: '100px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)', 
                  zIndex: 50 
                }}>
                  {['CAD', 'USD', 'EUR', 'GBP', 'AUD'].map((c) => (
                    <button 
                      key={c}
                      onClick={() => { setCurrency(c as any); setIsCurrencyOpen(false); }}
                      style={{ 
                        background: currency === c ? 'rgba(255, 183, 3, 0.1)' : 'transparent', 
                        color: currency === c ? 'var(--accent-color)' : 'var(--text-muted)', 
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '14px', 
                        fontWeight: currency === c ? 'bold' : 'normal',
                        padding: '8px 20px', 
                        cursor: 'pointer',
                        transition: 'background 0.2s, color 0.2s' 
                      }}
                      onMouseOver={(e) => { 
                        if (currency !== c) {
                          e.currentTarget.style.color = 'white'; 
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; 
                        }
                      }}
                      onMouseOut={(e) => { 
                        if (currency !== c) {
                          e.currentTarget.style.color = 'var(--text-muted)'; 
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link href="/buy-list" style={{ color: 'var(--text-accent)', textDecoration: 'none', fontWeight: 800, fontSize: '14px', transition: 'color 0.2s' }}>
                Buy-List
              </Link>
              <Link href="/account" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 800, fontSize: '14px', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-accent)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>
                Account
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '14px', fontWeight: 800, transition: 'color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-accent)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 800, fontSize: '14px', padding: '8px 24px', background: 'var(--bg-color-start)', borderRadius: '24px', border: 'var(--border-width) solid var(--glass-border)', boxShadow: '2px 2px 0px var(--glass-border)', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translate(-2px, -2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translate(0px, 0px)'}>
              Login
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            style={{ 
              background: 'var(--glass-bg)', border: 'var(--border-width) solid var(--glass-border)', color: 'var(--text-main)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', padding: '6px', borderRadius: '50%', boxShadow: '2px 2px 0px var(--glass-border)'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <ShoppingCart size={28} />
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-10px', background: '#ff3366', color: 'white', fontSize: '13px', fontWeight: 'bold', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(255,51,102,0.6)' }}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Sub-Nav Row: Categories */}
      <div style={{ background: 'var(--bg-color-end)', padding: '10px 40px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center', borderTop: 'var(--border-width) solid var(--glass-border)' }}>
        
        {/* Left Links */}
        <Link href="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>
          Home
        </Link>
        <Link href="/buy-list" style={{ color: 'var(--text-accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-accent)'}>
          Sell to Us
        </Link>
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin/orders" style={{ color: 'var(--text-success)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Admin</Link>
        )}

        <div style={{ width: '1px', height: '16px', background: 'var(--glass-border)', margin: '0 8px' }} />

        <Link href="/" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>All Categories</Link>
        {topLevelCategories.map((c: any) => {
          const children = categories.filter((sub: any) => sub.parentId === c.id);
          
          if (children.length > 0) {
            return (
              <div 
                key={c.id} 
                style={{ position: 'relative', display: 'inline-block', paddingBottom: '16px', marginBottom: '-16px' }}
                onMouseEnter={() => setHoveredCategory(c.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={`/?categoryId=${c.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', padding: '8px 0', fontWeight: 'bold' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-accent)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>
                  {c.name} ▾
                </Link>
                {hoveredCategory === c.id && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--glass-bg)', border: 'var(--border-width) solid var(--glass-border)', borderRadius: '8px', padding: '8px 0', minWidth: '180px', display: 'flex', flexDirection: 'column', boxShadow: 'var(--glass-glow)', zIndex: 50 }}>
                    {children.map((sub: any) => (
                      <Link key={sub.id} href={`/?categoryId=${sub.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', padding: '8px 16px', transition: 'background 0.2s, color 0.2s', fontWeight: 'bold' }}
                            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-accent)'; e.currentTarget.style.background = 'var(--bg-color-start)' }}
                            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'transparent' }}>
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={c.id}>
              <Link href={`/?categoryId=${c.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', fontWeight: 'bold' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-accent)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>
                {c.name}
              </Link>
            </div>
          );
        })}

        {/* Right Links */}
        <div style={{ width: '1px', height: '16px', background: 'var(--glass-border)', margin: '0 8px' }} />
        <Link href="/contact" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-accent)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-main)'}>
          Contact
        </Link>
      </div>
    </header>
  );
}
