import Link from 'next/link';

export const dynamic = 'force-static';

export default function ShippingPolicyPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', lineHeight: '1.6' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '32px' }}>Shipping Policy</h1>
      
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ color: 'var(--accent-color)', marginBottom: '16px' }}>Domestic Shipping (Canada & USA)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
          Orders are typically processed within 1-2 business days. We offer several shipping tiers:
        </p>
        <ul style={{ color: 'var(--text-muted)', marginLeft: '24px', marginBottom: '24px' }}>
          <li style={{ marginBottom: '8px' }}><strong>Standard Shipping:</strong> 3-7 business days</li>
          <li style={{ marginBottom: '8px' }}><strong>Expedited Shipping:</strong> 2-4 business days</li>
          <li><strong>Priority Shipping:</strong> 1-2 business days</li>
        </ul>

        <h2 style={{ color: 'var(--accent-color)', marginBottom: '16px' }}>International Shipping</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          We currently ship to Australia and most European countries. Delivery times for international orders vary from 7-21 business days depending on the destination. Please note that buyers are responsible for any customs and import taxes that may apply. We are not responsible for delays due to customs.
        </p>

        <h2 style={{ color: 'var(--accent-color)', marginBottom: '16px' }}>Packaging Standards</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          All singles are shipped sleeved and in a toploader/cardsaver. High-value cards are shipped with additional protection. Sealed products are shipped in sturdy boxes with adequate padding to prevent denting.
        </p>

        <h2 style={{ color: 'var(--accent-color)', marginBottom: '16px' }}>Lost or Damaged Packages</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          If your package is lost in transit or arrives damaged, please <Link href="/contact" style={{ color: 'var(--accent-color)' }}>contact us</Link> immediately. Please keep all original packaging materials as they may be required for insurance claims.
        </p>
      </div>
    </div>
  );
}
