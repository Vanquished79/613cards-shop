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
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const submissionId = parseInt(resolvedParams.id);
    if (isNaN(submissionId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email as string } });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const submission = await prisma.buyListSubmission.findUnique({
      where: { id: submissionId }
    });

    if (!submission || submission.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.buyListSubmission.update({
      where: { id: submissionId },
      data: { status: 'REJECTED' }
    });

    await prisma.buyListItem.updateMany({
      where: { submissionId: submissionId },
      data: { status: 'REJECTED' }
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    console.error('Decline Offer error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
