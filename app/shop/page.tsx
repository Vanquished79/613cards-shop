import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ShopFilters } from '@/components/ShopFilters';

export const dynamic = 'force-dynamic';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const now = new Date();
  
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

  const products = await prisma.product.findMany({ 
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

  const productsWithStock = products.map((p: any) => {
    const reservedCount = p.reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    return {
      ...p,
      availableStock: Math.max(0, p.stock - reservedCount)
    };
  });

  return (
    <div style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '32px' }}>Browse <span style={{ color: 'var(--accent-color)' }}>Products</span></h1>
      
      <ShopFilters categories={categories} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
        {productsWithStock.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products match your filters. Try adjusting them!</p>
        ) : (
          productsWithStock.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>
    </div>
  );
}
