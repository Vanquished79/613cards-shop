import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const submissionId = parseInt(resolvedParams.id);
    if (isNaN(submissionId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const submission = await prisma.buyListSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Handle payouts
    if (submission.payoutMethod === 'STORE_CREDIT' && submission.creditOffer) {
      await prisma.user.update({
        where: { id: submission.userId },
        data: { storeCredit: { increment: submission.creditOffer } }
      });
    }

    const updated = await prisma.buyListSubmission.update({
      where: { id: submissionId },
      data: { status: 'COMPLETED' }
    });

    await prisma.buyListItem.updateMany({
      where: { submissionId: submissionId },
      data: { status: 'COMPLETED' }
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error('Complete BuyList error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
