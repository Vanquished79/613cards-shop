import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let userId = parseInt(session.user.id as string);
    if (isNaN(userId)) {
      if (session.user.id === 'admin') {
         // Create or find a dummy admin user in the DB to attach wishlist items to
         let adminUser = await prisma.user.findUnique({ where: { email: 'admin@613cards.online' } });
         if (!adminUser) {
           adminUser = await prisma.user.create({
             data: {
               email: 'admin@613cards.online',
               passwordHash: '',
               name: 'Admin Fallback',
               role: 'ADMIN'
             }
           });
         }
         userId = adminUser.id;
      } else {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
    }

    // Check if it already exists
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existing) {
      // Remove it
      await prisma.wishlistItem.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ status: 'removed' });
    } else {
      // Add it
      await prisma.wishlistItem.create({
        data: {
          userId,
          productId
        }
      });
      return NextResponse.json({ status: 'added' });
    }

  } catch (error: any) {
    console.error('Wishlist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
