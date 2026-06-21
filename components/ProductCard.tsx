'use client';

import { useCart } from './CartProvider';

export function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ height: '200px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>No Image</span>
        )}
      </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>{product.name}</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{product.category?.name || 'Uncategorized'}</span>
            <span style={{ fontSize: '14px', color: product.availableStock > 0 ? '#4ade80' : '#ff8080', fontWeight: 'bold' }}>
              {product.availableStock > 0 ? `${product.availableStock} in stock` : 'Out of Stock'}
            </span>
          </div>

          {product.condition && product.condition !== 'N/A' && (
            <div style={{ marginBottom: '16px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
                {product.condition}
              </span>
            </div>
          )}

          <p style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1, marginBottom: '16px' }}>{product.description}</p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '20px' }}>${product.price.toFixed(2)}</span>
        <button 
          className="btn-primary" 
          style={{ 
            padding: '8px 16px', 
            fontSize: '14px',
            opacity: product.availableStock === 0 ? 0.5 : 1,
            cursor: product.availableStock === 0 ? 'not-allowed' : 'pointer'
          }}
          disabled={product.availableStock === 0}
          onClick={() => addToCart(product)}
        >
          {product.availableStock === 0 
            ? (product.stock > 0 ? 'In Another Cart' : 'Out of Stock') 
            : 'Add to Cart'}
        </button>
      </div>
      </div>
    </div>
  );
}
