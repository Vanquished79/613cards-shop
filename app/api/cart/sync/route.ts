import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { sessionId, items } = await request.json();

    if (!sessionId || !items) {
      return NextResponse.json({ error: 'Missing sessionId or items' }, { status: 400 });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    // We use a transaction to ensure atomic inventory check and lock
    const finalizedItems = await prisma.$transaction(async (tx) => {
      // 1. Delete all existing reservations for this session (so we can re-reserve without double counting)
      await tx.stockReservation.deleteMany({
        where: { sessionId }
      });

      const syncedItems = [];

      for (const item of items) {
        // Find the product variation and the parent product
        const variation = await tx.productVariation.findUnique({
          where: { id: item.productVariationId },
          include: { product: true }
        });

        if (!variation) continue;

        // Calculate active reservations from OTHER sessions
        const activeReservations = await tx.stockReservation.aggregate({
          where: {
            productVariationId: item.productVariationId,
            expiresAt: { gt: now }
          },
          _sum: { quantity: true }
        });

        const otherReservedQuantity = activeReservations._sum.quantity || 0;
        const availableStock = Math.max(0, variation.stock - otherReservedQuantity);

        // Can we satisfy the requested quantity?
        const allowedQuantity = Math.min(item.quantity, availableStock);

        if (allowedQuantity > 0) {
          // Create the new reservation
          await tx.stockReservation.create({
            data: {
              sessionId,
              productVariationId: item.productVariationId,
              quantity: allowedQuantity,
              expiresAt
            }
          });

          syncedItems.push({
            ...item,
            quantity: allowedQuantity,
            price: variation.price, // ensure price is up-to-date
            name: variation.product.name,
            imageUrl: variation.product.imageUrl,
            condition: variation.condition,
            isGraded: variation.isGraded,
            gradingCompany: variation.gradingCompany,
            grade: variation.grade
          });
        }
      }

      return syncedItems;
    });

    return NextResponse.json({ items: finalizedItems });
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}
