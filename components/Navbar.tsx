'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { ShoppingCart } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import logoImg from '../public/brand-icon.png';

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
    <header style={{ position: 'sticky', top: 0, zIndex: 30, width: '100%', borderBottom: '1px solid var(--glass-border)', background: 'rgba(26, 11, 46, 0.95)', backdropFilter: 'blur(12px)' }}>
      {/* Top Main Row */}
      <div className="navbar-top-row">
        
        {/* Left: Logo */}
        <div className="navbar-logo-container">
          <Link href="/" className="navbar-logo-link">
            <Image src={logoImg} alt="613cards.online Logo" width={150} height={150} className="navbar-logo-img" priority />
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
                border: '2px solid rgba(255,183,3,0.3)', 
                background: 'rgba(0,0,0,0.3)', 
                color: 'white', 
                outline: 'none',
                fontSize: '15px',
                transition: 'border-color 0.2s',
              }} 
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,183,3,0.3)'}
            />
            <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-color)' }} />
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
              color: 'var(--text-muted)', 
              fontSize: '14px', 
              fontWeight: 600, 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
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
              <Link href="/account" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                Account
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
              background: 'none', border: 'none', color: 'white', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s'
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
      <div style={{ background: 'rgba(10, 6, 20, 0.4)', padding: '10px 40px', display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        
        {/* Left Links */}
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          Home
        </Link>
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin/orders" style={{ color: '#4ade80', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>Admin</Link>
        )}

        <div style={{ width: '1px', height: '16px', background: 'var(--glass-border)', margin: '0 8px' }} />

        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>All Categories</Link>
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
                <Link href={`/?categoryId=${c.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s', padding: '8px 0' }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                  {c.name} ▾
                </Link>
                {hoveredCategory === c.id && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, background: 'rgba(26, 11, 46, 0.98)', backdropFilter: 'blur(16px)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '8px 0', minWidth: '180px', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 50 }}>
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
            <div key={c.id}>
              <Link href={`/?categoryId=${c.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                {c.name}
              </Link>
            </div>
          );
        })}

        {/* Right Links */}
        <div style={{ width: '1px', height: '16px', background: 'var(--glass-border)', margin: '0 8px' }} />
        <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
          Contact
        </Link>
      </div>
    </header>
  );
}
