import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    const submission = await prisma.buyListSubmission.update({
      where: { id: parseInt(params.id) },
      data: { status }
    });

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error('Update BuyList error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
