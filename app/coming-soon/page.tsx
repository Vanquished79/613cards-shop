import Image from 'next/image';

export default function ComingSoon() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 0%, #302048, var(--bg-color-end) 80%)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div className="glass-panel" style={{
        padding: '60px 40px',
        maxWidth: '600px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <Image 
          src="/logo.png" 
          alt="613cards.com Logo" 
          width={300} 
          height={150} 
          style={{ objectFit: 'contain', mixBlendMode: 'lighten', marginBottom: '20px' }} 
          priority 
        />
        
        <h1 style={{ fontSize: '42px', margin: 0, fontWeight: 800 }}>
          <span style={{ color: 'var(--text-main)' }}>Coming</span> <span style={{ color: 'var(--accent-color)' }}>Soon</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
          The premier destination for trading cards and supplies is almost ready. We are working hard to build the ultimate collection for you.
        </p>

        <div style={{ marginTop: '32px', width: '100%', height: '1px', background: 'var(--glass-border)' }} />
        
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Follow us for updates and exclusive drops!
        </p>
      </div>
    </div>
  );
}
