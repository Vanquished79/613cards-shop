'use client';

import { useCart } from '@/components/CartProvider';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Qty: {item.quantity}</span>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', paddingTop: '8px' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--accent-color)' }}>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '20px' }}>Payment Details</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
            Complete your purchase securely via PayPal. Your shipping address will be collected automatically.
          </p>
          
          <div style={{ zIndex: 1, position: 'relative', background: 'white', padding: '16px', borderRadius: '12px' }}>
            <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test', currency: 'USD' }}>
              <PayPalButtons 
                style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [{
                      amount: {
                        currency_code: 'USD',
                        value: totalAmount.toFixed(2)
                      }
                    }]
                  });
                }}
                onApprove={async (data, actions) => {
                  setIsProcessing(true);
                  try {
                    const details = await actions.order!.capture();
                    // Save the order to our database
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
                        items: items
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
