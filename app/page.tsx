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
    whereClause.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { cardSeries: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (categoryId) {
    const childCategories = await prisma.category.findMany({ where: { parentId: categoryId } });
    if (childCategories.length > 0) {
      const categoryIds = [categoryId, ...childCategories.map((c: any) => c.id)];
      whereClause.categoryId = { in: categoryIds };
    } else {
      whereClause.categoryId = categoryId;
    }
  }
  if (condition) {
    whereClause.condition = condition;
  }
  
  if (resolvedParams.isRookie === 'true') whereClause.isRookie = true;
  if (resolvedParams.isAutograph === 'true') whereClause.isAutograph = true;
  if (resolvedParams.isNumbered === 'true') whereClause.isNumbered = true;

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

  const isFiltering = !!q || !!categoryId || !!condition || !!sort;
  let resultsTitle = "Latest Additions";
  if (q) resultsTitle = `Results for "${q}"`;
  else if (categoryId) {
    const cat = categories.find((c: any) => c.id === categoryId);
    if (cat) resultsTitle = `${cat.name} Products`;
  }

  const resultsSection = (
    <div style={{ width: '100%', maxWidth: '1000px' }}>
      <h2 style={{ fontSize: '28px', margin: '0 0 20px 0' }}>
        {resultsTitle.split(' ')[0]} <span style={{ color: 'var(--accent-color)' }}>{resultsTitle.split(' ').slice(1).join(' ')}</span>
      </h2>
      <div className="product-grid">
        {latestWithStock.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products found. Try adjusting your search!</p>
        ) : (
          latestWithStock.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>
    </div>
  );

  const featuredSection = featuredWithStock.length > 0 && (
    <div style={{ width: '100%', maxWidth: '1000px', marginBottom: '20px' }}>
      <h2 style={{ fontSize: '28px', margin: '0 0 20px 0' }}>Featured <span style={{ color: 'var(--accent-color)' }}>Products</span></h2>
      <div className="product-grid">
        {featuredWithStock.map((p: any) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '40px', padding: '40px 0' }}>
      {isFiltering ? (
        <>
          {resultsSection}
          {featuredSection}
        </>
      ) : (
        <>
          {featuredSection}
          {resultsSection}
        </>
      )}
    </main>
  );
}
