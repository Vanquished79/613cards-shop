'use client';

import { useState } from 'react';

import { ProductCard } from '@/components/ProductCard';

type Order = any; 
type WishlistItem = any;

const ORDER_STAGES = ['PAID', 'CONFIRMED', 'PACKING', 'SHIPPED', 'DELIVERED'];

export default function AccountTabs({ orders, wishlistItems = [], buyListSubmissions = [] }: { orders: Order[], wishlistItems?: WishlistItem[], buyListSubmissions?: any[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'wishlist' | 'buylist'>('active');

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
        <button 
          onClick={() => setActiveTab('buylist')}
          style={{ 
            background: 'transparent', border: 'none', 
            color: activeTab === 'buylist' ? 'var(--accent-color)' : 'var(--text-muted)', 
            padding: '8px 0', fontWeight: activeTab === 'buylist' ? 'bold' : 'normal',
            borderBottom: activeTab === 'buylist' ? '2px solid var(--accent-color)' : '2px solid transparent',
            cursor: 'pointer', fontSize: '16px'
          }}
        >
          Sell Orders ({buyListSubmissions.length})
        </button>
      </div>

      {activeTab === 'buylist' ? (
        buyListSubmissions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't submitted any sell orders yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {buyListSubmissions.map((sub: any) => (
              <div key={sub.id} className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Submission #{sub.id}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(sub.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>Status: {sub.status.replace(/_/g, ' ')}</div>
                  </div>
                </div>

                {sub.status === 'OFFER_MADE' && (
                  <div style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#3b82f6' }}>You have an offer!</h3>
                    <p style={{ margin: '0 0 16px 0' }}>We have reviewed your cards and made the following offers:</p>
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                      <div style={{ flex: 1, padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Cash Offer (PayPal)</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-color)' }}>${sub.cashOffer?.toFixed(2)}</div>
                      </div>
                      <div style={{ flex: 1, padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Store Credit Offer</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e' }}>${sub.creditOffer?.toFixed(2)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        onClick={async () => {
                          const email = prompt("Enter your PayPal Email address:");
                          if (!email) return;
                          try {
                            const res = await fetch(`/api/user/buy-list/${sub.id}/accept`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ payoutMethod: 'PAYPAL', paypalEmail: email })
                            });
                            if (res.ok) window.location.reload();
                          } catch (err) { alert('Error accepting offer'); }
                        }}
                        style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Accept Cash
                      </button>
                      <button 
                        onClick={async () => {
                          if (!confirm("Accept Store Credit offer?")) return;
                          try {
                            const res = await fetch(`/api/user/buy-list/${sub.id}/accept`, {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ payoutMethod: 'STORE_CREDIT' })
                            });
                            if (res.ok) window.location.reload();
                          } catch (err) { alert('Error accepting offer'); }
                        }}
                        style={{ flex: 1, padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Accept Store Credit
                      </button>
                      <button 
                        onClick={async () => {
                          if (!confirm("Are you sure you want to decline this offer?")) return;
                          try {
                            const res = await fetch(`/api/user/buy-list/${sub.id}/decline`, { method: 'POST' });
                            if (res.ok) window.location.reload();
                          } catch (err) { alert('Error declining offer'); }
                        }}
                        style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {sub.status === 'ACCEPTED' && (
                  <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '8px', marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#22c55e' }}>Offer Accepted</h3>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Please mail your cards securely to:</p>
                    <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      613 Cards Shop<br/>
                      123 Trading Card Ln<br/>
                      Ottawa, ON K1A 0B1<br/>
                      Canada
                    </div>
                    <p style={{ margin: '12px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                      You selected: {sub.payoutMethod === 'PAYPAL' ? `PayPal (${sub.paypalEmail})` : 'Store Credit'}.
                      We will process your payout once we receive and verify your cards!
                    </p>
                  </div>
                )}
                
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Cards ({sub.items.length})</h4>
                  {sub.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span>{item.quantity}x {item.cardName} {item.cardSeries ? `(${item.cardSeries})` : ''} - {item.condition} {item.isGraded ? `[${item.gradingCompany} ${item.grade}]` : ''}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'wishlist' ? (
        wishlistItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't wishlisted any items yet.</p>
        ) : (
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {wishlistItems.map((item: any) => (
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
                      <span>{item.quantity}x {item.productVariation.product.name} - {item.productVariation.condition}</span>
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
