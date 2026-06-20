import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const now = new Date();
  const products = await prisma.product.findMany({ 
    include: { 
      category: true,
      reservations: {
        where: { expiresAt: { gt: now } }
      }
    } 
  });

  const productsWithStock = products.map(p => {
    const reservedCount = p.reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    return {
      ...p,
      availableStock: Math.max(0, p.stock - reservedCount)
    };
  });

  return (
    <div style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Browse <span style={{ color: 'var(--accent-color)' }}>Products</span></h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {productsWithStock.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products available yet. Check back later!</p>
        ) : (
          productsWithStock.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>
    </div>
  );
}
