'use client';

import { useCart } from '@/components/CartProvider';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useCurrency } from '@/components/CurrencyProvider';
import { calculateShipping, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import { CANADIAN_PROVINCES, EUROPEAN_COUNTRIES, calculateTaxes } from '@/lib/taxes';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart, updateQuantity, removeFromCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Checkout Step 1 States
  const [country, setCountry] = useState('');
  const [province, setProvince] = useState('');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<'SHIPPING' | 'VAULT'>('SHIPPING');

  // Store Credit & VIP
  const [storeCredit, setStoreCredit] = useState(0);
  const [useStoreCredit, setUseStoreCredit] = useState(false);
  const [vipTier, setVipTier] = useState<string>('MEMBER');
  const [vipSettings, setVipSettings] = useState({ silver: 2, gold: 5, obsidian: 10 });

  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.taxEnabled !== undefined) setTaxEnabled(data.taxEnabled);
      setVipSettings({
        silver: data.silverBonus ?? 2,
        gold: data.goldBonus ?? 5,
        obsidian: data.obsidianBonus ?? 10
      });
    }).catch(e => console.error(e));

    // Fetch user profile for store credit, address pre-fill, and VIP tier
    if (session?.user) {
      fetch('/api/user/profile').then(r => r.json()).then(data => {
        if (data.storeCredit) setStoreCredit(data.storeCredit);
        if (data.vipTier) setVipTier(data.vipTier);
        if (data.country) {
          setCountry(data.country);
          if (data.state && data.country === 'CA') {
            setProvince(data.state);
          }
        }
      }).catch(e => console.error(e));
    }
  }, [session]);

  // VIP Discount Calculation
  let discountPercent = 0;
  if (vipTier === 'SILVER') discountPercent = vipSettings.silver;
  if (vipTier === 'GOLD') discountPercent = vipSettings.gold;
  if (vipTier === 'OBSIDIAN') discountPercent = vipSettings.obsidian;
  
  const discountAmount = totalAmount * (discountPercent / 100);
  const subtotalAfterDiscount = totalAmount - discountAmount;

  // Calculations
  const shippingCost = calculateShipping(subtotalAfterDiscount);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalAfterDiscount);

  // Step 1 complete if valid country selected (and province if CA)
  const isStep1Complete = !!(country && (country !== 'CA' || province));
  
  const taxInfo = useMemo(() => {
    if (!isStep1Complete || !taxEnabled) return null;
    return calculateTaxes(country, province, subtotalAfterDiscount + shippingCost);
  }, [isStep1Complete, country, province, subtotalAfterDiscount, shippingCost, taxEnabled]);

  const finalTotal = subtotalAfterDiscount + shippingCost + (taxInfo ? taxInfo.amount : 0);
  const storeCreditUsed = useStoreCredit ? Math.min(storeCredit, finalTotal) : 0;
  const amountToPay = Math.max(0, finalTotal - storeCreditUsed);

  const handlePlaceOrderDirectly = async () => {
    setIsProcessing(true);
    try {
      const sessionId = localStorage.getItem('cartSessionId');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: `SC-${Date.now()}`,
          customerName: session?.user?.name || 'Store Credit User',
          email: session?.user?.email,
          address: session?.user?.address || 'N/A',
          city: session?.user?.city || 'N/A',
          state: session?.user?.state || 'N/A',
          zip: session?.user?.zip || 'N/A',
          country: country,
          totalAmount: finalTotal,
          taxAmount: taxInfo ? taxInfo.amount : 0,
          taxRate: taxInfo ? taxInfo.rate : 0,
          items: items,
          userId: session?.user?.id ? parseInt(session.user.id as string) : null,
          sessionId: sessionId,
          storeCreditUsed: storeCreditUsed,
          shippingMethod: shippingMethod
        })
      });
      
      if (response.ok) {
        setSuccess(true);
        clearCart();
      } else {
        toast.error('Error saving your order. Please contact support.');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

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
              <div key={`${item.id}-${item.productVariationId}`} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--glass-bg)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No Img</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {item.condition} {item.isGraded ? `(${item.gradingCompany} ${item.grade})` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button 
                        onClick={() => updateQuantity(item.productVariationId, item.quantity - 1)}
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}
                      >-</button>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productVariationId, item.quantity + 1)}
                        style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}
                      >+</button>
                      <button 
                        onClick={() => removeFromCart(item.productVariationId)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-error)', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '8px' }}
                      >Remove</button>
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text-muted)', paddingTop: '8px' }}>
              <span>Subtotal:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            {discountPercent > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text-success)' }}>
                <span>VIP Discount ({discountPercent}%):</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text-muted)' }}>
              <span>Shipping:</span>
              <span>{shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}</span>
            </div>
            
            {taxInfo && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: 'var(--text-muted)' }}>
                <span>Taxes ({taxInfo.name}):</span>
                <span>{taxInfo.amount > 0 ? formatPrice(taxInfo.amount) : '0.00'}</span>
              </div>
            )}
            
            {useStoreCredit && storeCreditUsed > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', color: '#22c55e', paddingTop: '8px' }}>
                <span>Store Credit Applied:</span>
                <span>-{formatPrice(storeCreditUsed)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid var(--glass-border)' }}>
              <span>Total:</span>
              <span style={{ color: 'var(--text-accent)' }}>{formatPrice(amountToPay)}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
          
          <h3 style={{ marginBottom: '20px' }}>1. Delivery Method</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            Please select your country to calculate shipping rates.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <select 
                value={country} 
                onChange={(e) => {
                  setCountry(e.target.value);
                  setProvince('');
                }}
                style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }}
              >
                <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Select Country</option>
                <option value="CA" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Canada</option>
                <option value="US" style={{ background: '#ffffff', color: 'var(--text-main)' }}>United States</option>
                <option value="AU" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Australia</option>
                <optgroup label="Europe" style={{ background: '#ffffff', color: 'var(--text-muted)' }}>
                  {EUROPEAN_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code} style={{ background: '#ffffff', color: 'var(--text-main)' }}>{c.name}</option>
                  ))}
                </optgroup>
                <option value="OTHER" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Other</option>
              </select>

            {country === 'CA' && (
              <select 
                value={province} 
                onChange={(e) => setProvince(e.target.value)}
                style={{ width: '100%', padding: '12px', background: '#ffffff', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }}
              >
                <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Select Province</option>
                {CANADIAN_PROVINCES.map(p => (
                  <option key={p.code} value={p.code} style={{ background: '#ffffff', color: 'var(--text-main)' }}>{p.name}</option>
                ))}
              </select>
            )}
            </div>

          <h3 style={{ marginBottom: '20px', color: isStep1Complete ? 'var(--text-main)' : 'var(--text-muted)' }}>2. Payment Details</h3>
          
          {!isStep1Complete ? (
            <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--text-muted)' }}>
              Complete Step 1 to unlock payment options.
            </div>
          ) : (
            <>
              {amountToFreeShipping > 0 ? (
                 <div style={{ padding: '12px', background: 'var(--glass-bg)', borderRadius: '8px', marginBottom: '20px' }}>
                   <div style={{ fontSize: '14px', marginBottom: '8px' }}>You are <strong>{formatPrice(amountToFreeShipping)}</strong> away from Free Shipping!</div>
                   <div style={{ height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ width: `${(subtotalAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s' }}></div>
                   </div>
                 </div>
              ) : (
                <div style={{ padding: '12px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
                  🎉 You've unlocked Free Shipping!
                </div>
              )}

              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>
                Complete your purchase securely via PayPal. Your shipping address will be collected automatically.
              </p>
              
              {currency !== 'CAD' && (
                <div style={{ padding: '12px', background: 'rgba(255, 183, 3, 0.1)', border: '1px solid rgba(255, 183, 3, 0.3)', borderRadius: '8px', color: 'var(--text-accent)', fontSize: '13px', marginBottom: '20px' }}>
                  <strong>Note:</strong> You will be billed <strong>C${finalTotal.toFixed(2)} CAD</strong>. Exchange rates shown are estimates.
                </div>
              )}
              
              {storeCredit > 0 && (
                <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#22c55e' }}>Store Credit Available: {formatPrice(storeCredit)}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>You can apply this to your order balance.</span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={useStoreCredit} 
                      onChange={(e) => setUseStoreCredit(e.target.checked)} 
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: 'bold' }}>Use Credit</span>
                  </label>
                </div>
              )}
              
              <div style={{ zIndex: 1, position: 'relative', background: 'white', padding: '16px', borderRadius: '12px', marginTop: currency === 'CAD' ? '20px' : '0' }}>
                {amountToPay === 0 ? (
                  <button 
                    onClick={handlePlaceOrderDirectly}
                    disabled={isProcessing}
                    style={{ width: '100%', padding: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                  >
                    {isProcessing ? 'Processing...' : 'Place Order (Fully Covered by Store Credit)'}
                  </button>
                ) : (
                  <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test', currency: 'CAD' }}>
                    <PayPalButtons 
                      style={{ layout: 'vertical', color: 'gold', shape: 'rect' }}
                      createOrder={(data, actions) => {
                        
                        // We must format exactly amountToPay. But PayPal expects the sum of breakdown.
                        // To bypass complex PayPal breakdown issues with negative discounts, 
                        // if store credit is used, we just pass the total amountToPay and no breakdown.
                        const purchaseUnit: any = {
                          description: '613cards Order',
                          amount: {
                            currency_code: 'CAD',
                            value: amountToPay.toFixed(2),
                          }
                        };

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
                            country: country,
                            totalAmount: finalTotal,
                            taxAmount: taxInfo ? taxInfo.amount : 0,
                            taxRate: taxInfo ? taxInfo.rate : 0,
                            items: items,
                            userId: session?.user?.id ? parseInt(session.user.id as string) : null,
                            sessionId: sessionId,
                            storeCreditUsed: storeCreditUsed,
                            shippingMethod: shippingMethod
                          })
                        });
                        
                        if (response.ok) {
                          setSuccess(true);
                          clearCart();
                        } else {
                          toast.error('Payment was successful but there was an error saving your order. Please contact support.');
                        }
                      } catch (error) {
                        console.error(error);
                        toast.error('An error occurred during checkout.');
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                  />
                </PayPalScriptProvider>
                )}
              </div>
              {isProcessing && <p style={{ textAlign: 'center', color: 'var(--text-accent)', marginTop: '16px' }}>Processing order...</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
