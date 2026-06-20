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
      <div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>{product.name}</h3>
        <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px', marginTop: '8px', display: 'inline-block' }}>
          {product.category?.name}
        </span>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1 }}>{product.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
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
  );
}
