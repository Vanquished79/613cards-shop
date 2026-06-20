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
      await tx.cartReservation.deleteMany({
        where: { sessionId }
      });

      const syncedItems = [];

      for (const item of items) {
        // Find the product
        const product = await tx.product.findUnique({
          where: { id: item.id }
        });

        if (!product) continue;

        // Calculate active reservations from OTHER sessions
        const activeReservations = await tx.cartReservation.aggregate({
          where: {
            productId: item.id,
            expiresAt: { gt: now }
          },
          _sum: { quantity: true }
        });

        const otherReservedQuantity = activeReservations._sum.quantity || 0;
        const availableStock = Math.max(0, product.stock - otherReservedQuantity);

        // Can we satisfy the requested quantity?
        const allowedQuantity = Math.min(item.quantity, availableStock);

        if (allowedQuantity > 0) {
          // Create the new reservation
          await tx.cartReservation.create({
            data: {
              sessionId,
              productId: item.id,
              quantity: allowedQuantity,
              expiresAt
            }
          });

          syncedItems.push({
            ...item,
            quantity: allowedQuantity,
            price: product.price, // ensure price is up-to-date
            name: product.name,
            imageUrl: product.imageUrl
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
