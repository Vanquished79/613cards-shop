'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ height: '280px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '16px', transition: 'transform 0.2s', cursor: 'pointer', position: 'relative' }}
             onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
             onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.4))' }} />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>No Image</span>
          )}
          
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: '#ff3366', color: 'white', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '12px', boxShadow: '0 4px 10px rgba(255,51,102,0.4)' }}>
              SALE
            </div>
          )}
        </div>
      </Link>
      
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>
            {product.name}
          </h3>
        </Link>
          
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{product.category?.name || 'Uncategorized'}</span>
          <span style={{ fontSize: '14px', color: product.availableStock > 0 ? '#4ade80' : '#ff8080', fontWeight: 'bold' }}>
            {product.availableStock > 0 ? `${product.availableStock} in stock` : 'Out of Stock'}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          {product.condition && product.condition !== 'N/A' && (
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              {product.condition}
            </span>
          )}

          {product.type === 'CARD' && (
            <>
              {product.isRookie && <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 'bold' }}>RC</span>}
              {product.isAutograph && <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', border: '1px solid rgba(168, 85, 247, 0.3)', fontWeight: 'bold' }}>Auto</span>}
              {product.isNumbered && <span style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', border: '1px solid rgba(234, 179, 8, 0.3)', fontWeight: 'bold' }}>#'d</span>}
              {product.isParallel && <span style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', border: '1px solid rgba(236, 72, 153, 0.3)', fontWeight: 'bold' }}>Parallel</span>}
            </>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '14px', marginBottom: '2px' }}>
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '20px' }}>${product.price.toFixed(2)}</span>
          </div>
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
