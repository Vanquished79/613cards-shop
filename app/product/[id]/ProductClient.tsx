'use client';

import { useCart } from '@/components/CartProvider';
import Link from 'next/link';

export function ProductClient({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', display: 'inline-block' }}>
        ← Back to Shop
      </Link>

      <div className="glass-panel" style={{ padding: '40px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* Left Side: Image */}
        <div style={{ flex: '1 1 300px', height: '400px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))' }} />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>No Image Available</span>
          )}
        </div>

        {/* Right Side: Details */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '32px' }}>{product.name}</h1>
            <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-color)' }}>${product.price.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', border: '1px solid var(--glass-border)' }}>
              {product.category?.name || 'Uncategorized'}
            </span>
            
            {product.condition && product.condition !== 'N/A' && (
              <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', border: '1px solid rgba(255,255,255,0.2)' }}>
                {product.condition}
              </span>
            )}

            <span style={{ fontSize: '14px', color: product.availableStock > 0 ? '#4ade80' : '#ff8080', fontWeight: 'bold' }}>
              {product.availableStock > 0 ? `${product.availableStock} in stock` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</h3>
            <p style={{ lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
              {product.description || 'No description available for this item.'}
            </p>
          </div>

          <div style={{ marginTop: 'auto', padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <button 
              className="btn-primary" 
              style={{ 
                width: '100%',
                padding: '16px', 
                fontSize: '18px',
                opacity: product.availableStock === 0 ? 0.5 : 1,
                cursor: product.availableStock === 0 ? 'not-allowed' : 'pointer'
              }}
              disabled={product.availableStock === 0}
              onClick={() => addToCart(product)}
            >
              {product.availableStock === 0 
                ? (product.stock > 0 ? 'In Another User\'s Cart' : 'Out of Stock') 
                : 'Add to Cart'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: '12px 0 0 0' }}>
              Items added to cart are reserved for 15 minutes.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
