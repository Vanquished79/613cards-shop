'use client';

import { useCart } from './CartProvider';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CartSlideOut() {
  const { items, totalAmount, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        onClick={() => setIsCartOpen(false)}
      />
      <div className="glass-panel" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100%',
        zIndex: 50, borderRadius: '24px 0 0 24px', display: 'flex', flexDirection: 'column',
        padding: '24px', transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '24px' }}>
            <ShoppingCart /> Your Cart
          </h2>
          <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Your cart is empty.</p>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No Img</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{item.name}</h4>
                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>${item.price.toFixed(2)}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={14} />
                    </button>
                    <span style={{ fontSize: '14px' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={14} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', marginLeft: 'auto', cursor: 'pointer', fontSize: '13px' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--accent-color)' }}>${totalAmount.toFixed(2)}</span>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '16px' }}
              onClick={() => {
                setIsCartOpen(false);
                router.push('/checkout');
              }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
