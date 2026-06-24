'use client';

import { useState } from 'react';

import { ProductCard } from '@/components/ProductCard';

type Order = any; 
type WishlistItem = any;

const ORDER_STAGES = ['PAID', 'CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'];

export default function AccountTabs({ orders, wishlistItems = [] }: { orders: Order[], wishlistItems?: WishlistItem[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'wishlist'>('active');

  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED');
  const archivedOrders = orders.filter((o) => o.status === 'DELIVERED');

  const displayedOrders = activeTab === 'active' ? activeOrders : archivedOrders;

  const getStageIndex = (status: string) => {
    const normalizedStatus = status === 'PENDING' ? 'PAID' : status;
    return ORDER_STAGES.indexOf(normalizedStatus);
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Account Information</h2>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
        <button 
          onClick={() => setActiveTab('active')}
          style={{ 
            background: 'transparent', border: 'none', 
            color: activeTab === 'active' ? 'var(--accent-color)' : 'var(--text-muted)', 
            padding: '8px 0', fontWeight: activeTab === 'active' ? 'bold' : 'normal',
            borderBottom: activeTab === 'active' ? '2px solid var(--accent-color)' : '2px solid transparent',
            cursor: 'pointer', fontSize: '16px'
          }}
        >
          Active Orders ({activeOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('archived')}
          style={{ 
            background: 'transparent', border: 'none', 
            color: activeTab === 'archived' ? 'var(--accent-color)' : 'var(--text-muted)', 
            padding: '8px 0', fontWeight: activeTab === 'archived' ? 'bold' : 'normal',
            borderBottom: activeTab === 'archived' ? '2px solid var(--accent-color)' : '2px solid transparent',
            cursor: 'pointer', fontSize: '16px'
          }}
        >
          Archived ({archivedOrders.length})
        </button>
        <button 
          onClick={() => setActiveTab('wishlist')}
          style={{ 
            background: 'transparent', border: 'none', 
            color: activeTab === 'wishlist' ? 'var(--accent-color)' : 'var(--text-muted)', 
            padding: '8px 0', fontWeight: activeTab === 'wishlist' ? 'bold' : 'normal',
            borderBottom: activeTab === 'wishlist' ? '2px solid var(--accent-color)' : '2px solid transparent',
            cursor: 'pointer', fontSize: '16px'
          }}
        >
          Wishlist ({wishlistItems.length})
        </button>
      </div>

      {activeTab === 'wishlist' ? (
        wishlistItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't wishlisted any items yet.</p>
        ) : (
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {wishlistItems.map((item) => (
              <ProductCard key={item.product.id} product={item.product} />
            ))}
          </div>
        )
      ) : (
        orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet.</p>
        ) : displayedOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No {activeTab} orders found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {displayedOrders.map((order) => {
            const currentStageIndex = getStageIndex(order.status);
            
            return (
              <div key={order.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>${order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Progress Tracker */}
                <div style={{ marginBottom: '32px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '12px', left: '10%', right: '10%', height: '2px', background: 'var(--glass-border)', zIndex: 0 }}></div>
                  <div style={{ position: 'absolute', top: '12px', left: '10%', right: `${100 - (10 + (80 / (ORDER_STAGES.length - 1)) * Math.max(0, currentStageIndex))}%`, height: '2px', background: 'var(--accent-color)', zIndex: 1, transition: 'right 0.5s ease' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                    {ORDER_STAGES.map((stage, idx) => {
                      const isCompleted = currentStageIndex >= idx;
                      const isCurrent = currentStageIndex === idx;
                      
                      return (
                        <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20%' }}>
                          <div style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            background: isCompleted ? 'var(--accent-color)' : '#1a1a2e',
                            border: `2px solid ${isCompleted ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isCurrent ? '0 0 10px rgba(255,183,3,0.5)' : 'none'
                          }}>
                            {isCompleted && <span style={{ color: '#000', fontSize: '12px' }}>✓</span>}
                          </div>
                          <span style={{ fontSize: '10px', color: isCompleted ? 'white' : 'var(--text-muted)', fontWeight: isCurrent ? 'bold' : 'normal', textTransform: 'capitalize' }}>
                            {stage.toLowerCase()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  {order.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span>{item.quantity}x {item.product.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {(() => {
                    const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
                    const shippingFee = Math.max(0, order.totalAmount - subtotal);
                    
                    return (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                          <span style={{ color: 'var(--text-muted)' }}>${subtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Shipping</span>
                          <span style={{ color: 'var(--text-muted)' }}>{shippingFee < 0.01 ? 'FREE' : `$${shippingFee.toFixed(2)}`}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', paddingTop: '4px' }}>
                          <span>Total</span>
                          <span style={{ color: 'var(--accent-color)' }}>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {order.trackingNumber && (
                  <div style={{ marginTop: '16px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Tracking: </span>
                      <strong style={{ color: 'var(--accent-color)' }}>{order.shippingCarrier ? `${order.shippingCarrier} - ` : ''}{order.trackingNumber}</strong>
                    </div>
                    {order.status !== 'DELIVERED' && (
                      <button 
                        onClick={async () => {
                          const { markOrderAsDelivered } = await import('./actions');
                          await markOrderAsDelivered(order.id);
                        }}
                        style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                )}
                {!order.trackingNumber && order.status !== 'DELIVERED' && (
                  <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <button 
                      onClick={async () => {
                        const { markOrderAsDelivered } = await import('./actions');
                        await markOrderAsDelivered(order.id);
                      }}
                      style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Mark as Delivered
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )
      )}
    </div>
  );
}
