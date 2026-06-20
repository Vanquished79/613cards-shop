import prisma from '@/lib/prisma';

export default async function ShopPage() {
  const products = await prisma.product.findMany({ include: { category: true } });

  return (
    <div style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Browse <span style={{ color: 'var(--accent-color)' }}>Products</span></h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products available yet. Check back later!</p>
        ) : (
          products.map((p: any) => (
            <div key={p.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ height: '200px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Image</span>
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>{p.name}</h3>
                <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px', marginTop: '8px', display: 'inline-block' }}>
                  {p.category.name}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', flex: 1 }}>{p.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '20px' }}>${p.price.toFixed(2)}</span>
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>Add to Cart</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
