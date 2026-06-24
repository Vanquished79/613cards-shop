export const dynamic = 'force-static';

export default function ReturnPolicyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', lineHeight: '1.6' }}>
      <h1 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Return & Refund Policy</h1>
      
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>1. Single Cards</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Due to the volatile nature of the trading card market, <strong>all sales of single trading cards are final</strong>. We do not accept returns or offer refunds for single cards once the order has been placed. Please review the card condition and any provided images carefully before purchasing.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>2. Factory Sealed Products</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Unopened factory sealed products (e.g., booster boxes, packs, elite trainer boxes) may be returned within <strong>14 days of delivery</strong> for a full refund, minus shipping costs. 
          The item must be in its original, tamper-evident shrink wrap. Any products that have been opened, tampered with, or damaged after delivery are strictly non-returnable.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>3. Supplies and Accessories</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Supplies such as sleeves, top loaders, and binders may be returned within 14 days of delivery, provided they are in brand new, unused condition and in their original packaging.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>4. Lost or Damaged in Transit</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          If your order arrives damaged, please contact us within 48 hours of delivery with photographic evidence of both the damaged item and the shipping packaging. If an order is lost in transit, we will work with the carrier to open an investigation and, if applicable, process a replacement or refund.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>5. How to Initiate a Return</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          To initiate a return for an eligible item, please use our <a href="/contact" style={{ color: 'var(--accent-color)' }}>Contact Form</a> with your Order ID and the reason for the return. 
          Return shipping costs are the responsibility of the buyer unless the return is a result of our error (e.g., you received an incorrect item).
        </p>
      </div>
    </div>
  );
}
