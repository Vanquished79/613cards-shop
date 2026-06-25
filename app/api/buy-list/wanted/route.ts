import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.buyListWantedItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Failed to fetch active wanted items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
