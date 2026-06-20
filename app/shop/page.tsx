import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

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
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>
    </div>
  );
}
