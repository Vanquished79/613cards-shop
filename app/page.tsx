import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ShopFilters } from '@/components/ShopFilters';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const now = new Date();
  
  // Featured Products
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { 
      category: true,
      reservations: {
        where: { expiresAt: { gt: now } }
      }
    }
  });

  const featuredWithStock = featuredProducts.map(p => {
    const reservedCount = p.reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    return {
      ...p,
      availableStock: Math.max(0, p.stock - reservedCount)
    };
  });

  // Filtered/Latest Products
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const categoryId = typeof resolvedParams.categoryId === 'string' ? parseInt(resolvedParams.categoryId) : undefined;
  const condition = typeof resolvedParams.condition === 'string' ? resolvedParams.condition : undefined;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : undefined;

  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  if (sort === 'price_desc') orderBy = { price: 'desc' };

  let whereClause: any = {};
  if (q) {
    whereClause.name = { contains: q, mode: 'insensitive' };
  }
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }
  if (condition) {
    whereClause.condition = condition;
  }

  const latestProducts = await prisma.product.findMany({ 
    where: whereClause,
    orderBy,
    include: { 
      category: true,
      reservations: {
        where: { expiresAt: { gt: now } }
      }
    } 
  });

  const categories = await prisma.category.findMany();

  const latestWithStock = latestProducts.map((p: any) => {
    const reservedCount = p.reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    return {
      ...p,
      availableStock: Math.max(0, p.stock - reservedCount)
    };
  });

  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '40px', padding: '40px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <Image src="/logo.png" alt="613cards.com Logo" width={460} height={230} style={{ margin: '0 auto', objectFit: 'contain', mixBlendMode: 'lighten' }} />
      </div>
      <div className="glass-panel" style={{ padding: '40px 60px', textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: '800', margin: 0 }}>
          Welcome to <span style={{ color: 'var(--accent-color)' }}>613cards.com</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6', margin: 0 }}>
          Discover the rarest trading cards, perfect your deck, and grab the best supplies to protect your collection.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '1000px' }}>
        <ShopFilters categories={categories} />
      </div>

      {featuredWithStock.length > 0 && (
        <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 20px 0' }}>Featured <span style={{ color: 'var(--accent-color)' }}>Products</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {featuredWithStock.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div style={{ width: '100%', maxWidth: '1000px' }}>
        <h2 style={{ fontSize: '28px', margin: '0 0 20px 0' }}>Latest <span style={{ color: 'var(--accent-color)' }}>Additions</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {latestWithStock.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No products match your filters. Try adjusting them!</p>
          ) : (
            latestWithStock.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
