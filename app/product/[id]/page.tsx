import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ProductClient } from './ProductClient';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Loading from '../loading'; // generic loading spinner

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<Loading />}>
      <ProductContent productIdStr={resolvedParams.id} />
    </Suspense>
  );
}

async function ProductContent({ productIdStr }: { productIdStr: string }) {
  const productId = parseInt(productIdStr);
  const now = new Date();
  
  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      variations: {
        include: {
          reservations: {
            where: { expiresAt: { gt: now } }
          }
        }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const variationsWithStock = product.variations.map((v: any) => {
    if (v.isManualOutOfStock) {
      return { ...v, availableStock: 0 };
    }
    const reservedCount = v.reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    return {
      ...v,
      availableStock: Math.max(0, v.stock - reservedCount)
    };
  });

  const totalAvailableStock = variationsWithStock.reduce((sum: number, v: any) => sum + v.availableStock, 0);

  const productData = {
    ...product,
    variations: variationsWithStock,
    availableStock: totalAvailableStock
  };

  return <ProductClient product={productData} />;
}
