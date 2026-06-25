import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paypalOrderId, customerName, email, address, city, state, zip, country, totalAmount, taxAmount, taxRate, items, userId, sessionId, shippingMethod } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Wrap in a transaction to ensure all or nothing
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          paypalOrderId,
          customerName,
          email,
          address: address || 'N/A',
          city: city || 'N/A',
          state: state || 'N/A',
          zip: zip || 'N/A',
          country: country || 'CA',
          totalAmount,
          taxAmount: taxAmount || 0,
          taxRate: taxRate || 0,
          status: shippingMethod === 'VAULT' ? 'DELIVERED' : 'PAID',
          shippingMethod: shippingMethod || 'SHIPPING',
          items: {
            create: items.map((item: any) => ({
              productVariationId: item.productVariationId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      // 2. Reduce stock for each product variation
      // 2.5 Vault items if requested
      for (const item of items) {
        // Find product variation for portfolio population if vaulted
        const variation = await tx.productVariation.update({
          where: { id: item.productVariationId },
          data: {
            stock: {
              decrement: item.quantity
            }
          },
          include: { product: true }
        });

        if (shippingMethod === 'VAULT' && userId) {
          for (let i = 0; i < item.quantity; i++) {
            await tx.portfolioItem.create({
              data: {
                userId: userId,
                cardName: variation.product.name,
                cardSeries: variation.product.series || null,
                isGraded: variation.isGraded,
                gradingCompany: variation.gradingCompany,
                grade: variation.grade,
                purchasePrice: item.price,
                currentValue: item.price, // Start at purchase price
                imageUrl: variation.imageUrl || variation.product.imageUrl,
                isVaulted: true,
                vaultStatus: 'VAULTED'
              }
            });
          }
        }
      }

      // 3. Clear reservations for this session since they bought it
      if (sessionId) {
        await tx.stockReservation.deleteMany({
          where: { sessionId }
        });
      }

      // 4. Deduct store credit
      if (userId && body.storeCreditUsed && body.storeCreditUsed > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { storeCredit: { decrement: body.storeCreditUsed } }
        });
      }

      return newOrder;
    });

    // Trigger Emails in the background
    import('@/lib/email').then(({ sendOrderConfirmation, sendAdminNotification }) => {
      sendOrderConfirmation(
        order.email, 
        order.customerName, 
        order.id, 
        order.totalAmount
      );
      sendAdminNotification(
        `New Order #${order.id} Received!`,
        `A new order has been placed by ${order.customerName} for $${order.totalAmount.toFixed(2)}.`
      );
    }).catch(console.error);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Failed to save order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
