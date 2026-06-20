import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paypalOrderId, customerName, email, address, city, state, zip, totalAmount, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Wrap in a transaction to ensure all or nothing
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          paypalOrderId,
          customerName,
          email,
          address: address || 'N/A',
          city: city || 'N/A',
          state: state || 'N/A',
          zip: zip || 'N/A',
          totalAmount,
          status: 'PAID',
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      // 2. Reduce stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to save order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
