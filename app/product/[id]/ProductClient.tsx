'use client';

import { useCart } from '@/components/CartProvider';
import Link from 'next/link';
import { useState } from 'react';
import { useCurrency } from '@/components/CurrencyProvider';
import { useWishlist } from '@/components/WishlistProvider';
import { getNumberedColor } from '@/lib/utils';

export function ProductClient({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const isWishlisted = wishlistIds.has(product.id);

  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isSuperZoomed, setIsSuperZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [selectedImage, setSelectedImage] = useState(product.imageUrl);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);

  const allImages = [product.imageUrl, ...(product.additionalImages || [])].filter(Boolean);

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSuperZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '24px', display: 'inline-block' }}>
        ← Back to Shop
      </Link>

      <div className="glass-panel product-details-container">
        
        {/* Left Side: Image */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            className="product-image-container" 
            style={{ width: '100%', height: '400px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', cursor: selectedImage ? 'zoom-in' : 'default' }}
            onClick={() => {
              if (selectedImage) {
                setIsImageExpanded(true);
                setIsSuperZoomed(false);
                setZoomPos({ x: 50, y: 50 });
              }
            }}
          >
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.15))' }} />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No Image Available</span>
            )}

            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#ff3366', color: 'white', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(255,51,102,0.4)' }}>
                SALE
              </div>
            )}

            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              style={{ 
                position: 'absolute', top: '16px', right: product.compareAtPrice && product.compareAtPrice > product.price ? '100px' : '16px', 
                background: 'var(--glass-bg)', borderRadius: '50%', width: '44px', height: '44px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                color: isWishlisted ? '#ff3366' : 'var(--text-muted)', transition: 'transform 0.2s, color 0.2s',
                boxShadow: 'var(--glass-glow)', border: 'var(--border-width) solid var(--glass-border)',
                transform: isWishlisted ? 'scale(1.1) translate(-2px, -2px)' : 'scale(1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1) translate(-2px, -2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = isWishlisted ? 'scale(1.1) translate(-2px, -2px)' : 'scale(1)'}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
          </div>
          
          {/* Thumbnails Gallery */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {allImages.map((img: string, idx: number) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{ 
                    width: '80px', height: '80px', flexShrink: 0, 
                    borderRadius: '8px', background: '#f1f5f9', 
                    border: selectedImage === img ? '2px solid var(--accent-color)' : '2px solid transparent',
                    cursor: 'pointer', overflow: 'hidden', padding: '4px'
                  }}
                >
                  <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Full Screen Image Overlay */}
        {isImageExpanded && product.imageUrl && (
          <div 
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
              backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 9999, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}
            onClick={() => {
              setIsImageExpanded(false);
              setIsSuperZoomed(false);
            }}
          >
            <div 
              style={{ position: 'absolute', top: '20px', right: '30px', color: 'var(--text-main)', fontSize: '40px', cursor: 'pointer', zIndex: 10000, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
              onClick={(e) => {
                e.stopPropagation();
                setIsImageExpanded(false);
                setIsSuperZoomed(false);
              }}
            >
              &times;
            </div>
            
            <div
              style={{
                width: '90vw',
                height: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isSuperZoomed ? 'zoom-out' : 'zoom-in',
                position: 'relative'
              }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent closing
                if (!isSuperZoomed) {
                  // On first click to zoom, center on the click position
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
                  const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
                  setZoomPos({ x, y });
                }
                setIsSuperZoomed(!isSuperZoomed);
              }}
              onMouseMove={handleOverlayMouseMove}
              onMouseLeave={() => {
                if (isSuperZoomed) {
                  setZoomPos({ x: 50, y: 50 }); // Optional: reset or keep edge
                }
              }}
            >
              <img 
                src={selectedImage} 
                alt={product.name} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain', 
                  filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.8))',
                  transform: isSuperZoomed ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transition: isSuperZoomed ? 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), transform-origin 0.3s ease',
                  willChange: 'transform'
                }} 
              />
            </div>
            
            {!isSuperZoomed && (
              <div style={{ position: 'absolute', bottom: '30px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '20px', pointerEvents: 'none' }}>
                Click image to super zoom
              </div>
            )}
          </div>
        )}

        {/* Right Side: Details */}
        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h1 style={{ margin: 0, fontSize: '32px' }}>{product.name}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {product.compareAtPrice && product.compareAtPrice > (selectedVariation ? selectedVariation.price : (product.variations.length > 0 ? Math.min(...product.variations.map((v:any) => v.price)) : 0)) && (
                <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '18px', marginBottom: '4px' }}>
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-accent)' }}>
                {selectedVariation 
                  ? formatPrice(selectedVariation.price)
                  : (() => {
                      const prices = product.variations?.map((v: any) => v.price) || [];
                      if (prices.length === 0) return 'Unavailable';
                      const minPrice = Math.min(...prices);
                      const maxPrice = Math.max(...prices);
                      return minPrice === maxPrice 
                        ? formatPrice(minPrice) 
                        : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
                    })()
                }
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '4px', fontSize: '14px', border: '1px solid var(--glass-border)' }}>
              {product.category?.name || 'Uncategorized'}
            </span>

            <span style={{ fontSize: '14px', color: product.availableStock > 0 ? 'var(--text-success)' : 'var(--text-error)', fontWeight: 'bold' }}>
              {product.availableStock > 0 ? `${product.availableStock} in stock` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</h3>
            <p style={{ lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
              {product.description || 'No description available for this item.'}
            </p>
          </div>

          {product.isPreorder && product.releaseDate && (
            <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#2563eb', fontWeight: 'bold' }}>📅 Expected Release Date:</span>
              <span>{new Date(product.releaseDate).toLocaleDateString()}</span>
            </div>
          )}

          {product.type === 'CARD' && (
            <div style={{ marginBottom: '32px', background: '#fafafa', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#f1f5f9', borderBottom: '1px solid var(--glass-border)', fontWeight: 'bold' }}>
                Card Specifications
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--glass-border)' }}>
                {product.cardName && (
                  <div style={{ padding: '12px 16px', background: 'var(--glass-bg)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Player / Character</div>
                    <div style={{ fontWeight: '500' }}>{product.cardName}</div>
                  </div>
                )}
                {product.cardSeries && (
                  <div style={{ padding: '12px 16px', background: 'var(--glass-bg)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Series / Year</div>
                    <div style={{ fontWeight: '500' }}>{product.cardSeries}</div>
                  </div>
                )}
                {product.cardBrand && (
                  <div style={{ padding: '12px 16px', background: 'var(--glass-bg)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Brand</div>
                    <div style={{ fontWeight: '500' }}>{product.cardBrand}</div>
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1', padding: '12px 16px', background: 'var(--glass-bg)', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {product.type === 'BREAK' && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 'bold' }}>
                        BREAK SPOT
                      </span>
                    )}
                    {product.isRookie && <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#1d4ed8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 'bold' }}>Rookie Card</span>}
                    {product.isAutograph && <span style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#7e22ce', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(168, 85, 247, 0.3)', fontWeight: 'bold' }}>Autograph</span>}
                    {product.isNumbered && (() => {
                      const colors = getNumberedColor(product.serialNumber);
                      return (
                        <span style={{ background: colors.bg, color: colors.text, padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: `1px solid ${colors.border}`, fontWeight: 'bold' }}>
                          {product.serialNumber ? `Numbered #${product.serialNumber}` : 'Numbered'}
                        </span>
                      );
                    })()}
                    {product.isParallel && <span style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#be185d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid rgba(236, 72, 153, 0.3)', fontWeight: 'bold' }}>Parallel</span>}
                    {!product.isRookie && !product.isAutograph && !product.isNumbered && !product.isParallel && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Base Card</span>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Variations Selector */}
          {product.variations && product.variations.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '12px' }}>Select Option</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {product.variations.map((v: any) => {
                  const isSelected = selectedVariation?.id === v.id;
                  const isOutOfStock = v.availableStock <= 0;
                  
                  return (
                    <div 
                      key={v.id}
                      onClick={() => {
                        if (!isOutOfStock) setSelectedVariation(v);
                      }}
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '16px', background: isSelected ? 'rgba(var(--accent-color-rgb), 0.1)' : '#fafafa', 
                        borderRadius: '8px', border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                        opacity: isOutOfStock ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold' }}>{v.condition}</span>
                          {v.isGraded && <span style={{ background: 'rgba(74, 222, 128, 0.2)', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{v.gradingCompany} {v.grade}</span>}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {isOutOfStock ? 'Out of Stock' : `${v.availableStock} available`}
                        </span>
                      </div>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-accent)' }}>
                        {formatPrice(v.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', padding: '24px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
            <button 
              className="btn-primary" 
              style={{ 
                width: '100%',
                padding: '16px', 
                fontSize: '18px',
                opacity: !selectedVariation || selectedVariation.availableStock === 0 ? 0.5 : 1,
                cursor: !selectedVariation || selectedVariation.availableStock === 0 ? 'not-allowed' : 'pointer'
              }}
              disabled={!selectedVariation || selectedVariation.availableStock === 0}
              onClick={() => addToCart({ ...product, selectedVariation })}
            >
              {!selectedVariation 
                ? 'Select an Option'
                : selectedVariation.availableStock === 0 
                  ? 'Out of Stock' 
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
