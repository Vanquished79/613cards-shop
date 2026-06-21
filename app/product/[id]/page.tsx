import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductClient } from './ProductClient';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  
  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      reservations: {
        where: { expiresAt: { gt: new Date() } }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const reservedCount = product.reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
  const availableStock = Math.max(0, product.stock - reservedCount);

  const productData = {
    ...product,
    availableStock
  };

  return <ProductClient product={productData} />;
}
