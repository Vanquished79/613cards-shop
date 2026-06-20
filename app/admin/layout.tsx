import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '24px', paddingTop: '20px' }}>
      <aside className="glass-panel" style={{ width: '250px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', height: 'fit-content' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '12px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>Admin Dashboard</h2>
        <Link href="/admin" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Overview</Link>
        <Link href="/admin/categories" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Categories</Link>
        <Link href="/admin/products" style={{ color: 'var(--text-main)', textDecoration: 'none', padding: '8px', borderRadius: '8px' }} className="hover-bg">Products</Link>
      </aside>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg:hover { background: rgba(255,255,255,0.1); }
      `}} />
    </div>
  );
}
