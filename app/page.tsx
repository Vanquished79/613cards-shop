import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const now = new Date();
  
  // Fetch up to 3 latest products from the database to show as "Featured"
  const featuredProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { 
      category: true,
      reservations: {
        where: { expiresAt: { gt: now } }
      }
    }
  });

  const productsWithStock = featuredProducts.map(p => {
    const reservedCount = p.reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    return {
      ...p,
      availableStock: Math.max(0, p.stock - reservedCount)
    };
  });

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
        </div>
      </div>

      {productsWithStock.length > 0 && (
        <>
          <h2 style={{ fontSize: '28px', margin: '20px 0 0 0' }}>Featured <span style={{ color: 'var(--accent-color)' }}>Products</span></h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', width: '100%', maxWidth: '1000px' }}>
            {productsWithStock.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
