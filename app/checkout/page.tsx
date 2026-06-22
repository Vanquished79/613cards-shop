'use client';

import { useCart } from '@/components/CartProvider';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCurrency } from '@/components/CurrencyProvider';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, updateQuantity, removeFromCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  if (items.length === 0 && !success) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2>Your cart is empty!</h2>
        <button className="btn-primary" onClick={() => router.push('/shop')} style={{ alignSelf: 'center', marginTop: '20px' }}>
          Go to Shop
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <h1 style={{ color: '#4ade80' }}>Payment Successful! 🎉</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Thank you for your order. We are preparing it for shipment.</p>
        <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: '24px' }}>
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0', maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
      <div>
        <h1 style={{ marginBottom: '24px' }}>Checkout</h1>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No Img</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}
                      >-</button>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}
                      >+</button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '12px', cursor: 'pointer', marginLeft: '8px', textDecoration: 'underline' }}
                      >Remove</button>
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', paddingTop: '8px' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--accent-color)' }}>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '20px' }}>Payment Details</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>
            Complete your purchase securely via PayPal. Your shipping address will be collected automatically.
          </p>
          
          {currency !== 'CAD' && (
            <div style={{ padding: '12px', background: 'rgba(255, 183, 3, 0.1)', border: '1px solid rgba(255, 183, 3, 0.3)', borderRadius: '8px', color: '#ffb703', fontSize: '13px', marginBottom: '20px' }}>
              <strong>Note:</strong> You will be billed <strong>C${totalAmount.toFixed(2)} CAD</strong>. Exchange rates shown are estimates.
            </div>
          )}
          
          <div style={{ zIndex: 1, position: 'relative', background: 'white', padding: '16px', borderRadius: '12px', marginTop: currency === 'CAD' ? '20px' : '0' }}>
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test', currency: 'CAD' }}>
              <PayPalButtons 
                style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
                createOrder={(data, actions) => {
                  
                  const purchaseUnit: any = {
                    description: '613cards Order',
                    amount: {
                      currency_code: 'CAD',
                      value: totalAmount.toFixed(2),
                      breakdown: {
                        item_total: {
                          currency_code: 'CAD',
                          value: totalAmount.toFixed(2)
                        }
                      }
                    },
                    items: items.map(item => ({
                      name: item.name.substring(0, 127),
                      ...(item.description ? { description: item.description.substring(0, 127) } : {}),
                      quantity: item.quantity.toString(),
                      unit_amount: {
                        currency_code: 'CAD',
                        value: item.price.toFixed(2)
                      },
                      ...(item.imageUrl ? { image_url: item.imageUrl.startsWith('http') ? item.imageUrl : `https://613cards.online${item.imageUrl}` } : {})
                    }))
                  };

                  // If user is logged in and has an address, pre-fill it for PayPal
                  if (session?.user && session.user.address) {
                    const [firstName, ...lastNameParts] = (session.user.name || '').split(' ');
                    const lastName = lastNameParts.join(' ');
                    purchaseUnit.shipping = {
                      name: { full_name: session.user.name },
                      address: {
                        address_line_1: session.user.address,
                        admin_area_2: session.user.city || '',
                        admin_area_1: session.user.state || '',
                        postal_code: session.user.zip || '',
                        country_code: 'US' // Assuming US for now
                      }
                    };
                  }

                  return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [purchaseUnit]
                  });
                }}
                onApprove={async (data, actions) => {
                  setIsProcessing(true);
                  try {
                    const details = await actions.order!.capture();
                    // Save the order to our database
                    const sessionId = localStorage.getItem('cartSessionId');
                    const response = await fetch('/api/orders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        paypalOrderId: details.id,
                        customerName: details.payer?.name?.given_name + ' ' + details.payer?.name?.surname,
                        email: details.payer?.email_address,
                        address: details.purchase_units?.[0]?.shipping?.address?.address_line_1,
                        city: details.purchase_units?.[0]?.shipping?.address?.admin_area_2,
                        state: details.purchase_units?.[0]?.shipping?.address?.admin_area_1,
                        zip: details.purchase_units?.[0]?.shipping?.address?.postal_code,
                        totalAmount: totalAmount,
                        items: items,
                        userId: session?.user?.id ? parseInt(session.user.id) : null,
                        sessionId: sessionId
                      })
                    });
                    
                    if (response.ok) {
                      setSuccess(true);
                      clearCart();
                    } else {
                      alert('Payment was successful but there was an error saving your order. Please contact support.');
                    }
                  } catch (error) {
                    console.error(error);
                    alert('An error occurred during checkout.');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              />
            </PayPalScriptProvider>
          </div>
          {isProcessing && <p style={{ textAlign: 'center', color: 'var(--accent-color)', marginTop: '16px' }}>Processing order...</p>}
        </div>
      </div>
    </div>
  );
}
