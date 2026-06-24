import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ wishlistIds: [] });
    }

    const userId = parseInt(session.user.id as string);
    if (isNaN(userId)) {
      return NextResponse.json({ wishlistIds: [] });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      select: { productId: true }
    });

    const wishlistIds = items.map(item => item.productId);
    return NextResponse.json({ wishlistIds });

  } catch (error) {
    console.error('Failed to get wishlist:', error);
    return NextResponse.json({ wishlistIds: [] });
  }
}
