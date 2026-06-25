import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ marginTop: 'auto', background: 'var(--bg-color-end)', borderTop: 'var(--border-width) solid var(--glass-border)', padding: '40px 20px', color: 'var(--text-muted)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
        
        <div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '16px' }}>613cards</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
            Your premier destination for sports cards, TCGs, and premium collecting supplies.
          </p>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '16px' }}>Shop</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link href="/" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Home</Link></li>
            <li><Link href="/shop" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>All Products</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '16px' }}>Customer Service</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><Link href="/faq" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>FAQ</Link></li>
            <li><Link href="/shipping-policy" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Shipping Policy</Link></li>
            <li><Link href="/contact" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Contact Us</Link></li>
            <li><Link href="/condition-guide" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Card Condition Guide</Link></li>
            <li><Link href="/return-policy" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Return Policy</Link></li>
            <li><Link href="/terms" style={{ color: 'inherit', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</Link></li>
          </ul>
        </div>

      </div>
      <div style={{ maxWidth: '1200px', margin: '40px auto 0 auto', paddingTop: '20px', borderTop: 'var(--border-width) dashed var(--glass-border)', textAlign: 'center', fontSize: '12px', color: 'var(--text-main)', fontWeight: 'bold' }}>
        &copy; {new Date().getFullYear()} 613cards. All rights reserved.
      </div>
    </footer>
  );
}
