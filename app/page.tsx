import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '40px', padding: '40px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <Image src="/logo.png" alt="613cards.com Logo" width={300} height={150} style={{ margin: '0 auto', objectFit: 'contain' }} />
      </div>
      <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', margin: 0 }}>
          Welcome to <span style={{ color: 'var(--accent-color)' }}>613cards.com</span>
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6' }}>
          Discover the rarest trading cards, perfect your deck, and grab the best supplies to protect your collection.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
          <Link href="/shop">
            <button className="btn-primary">Shop Now</button>
          </Link>
          <Link href="/admin">
            <button className="glass-panel" style={{ padding: '12px 24px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
              Admin Panel
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', width: '100%', maxWidth: '1000px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ height: '200px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Mockup Image</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Featured Card {i}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Holographic rare from the new expansion set.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '20px' }}>$99.99</span>
              <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
