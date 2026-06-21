import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const newMessage = await prisma.contactMessage.create({
      data: { name, email, message }
    });

    // Trigger email notification to admin
    import('@/lib/email').then(({ sendAdminNotification }) => {
      sendAdminNotification(
        `New Contact Message from ${name}`,
        `You received a new message from ${name} (${email}):\n\n${message}`
      );
    }).catch(console.error);

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to save message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
