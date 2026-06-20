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

    // NOTE: This is where you would integrate an email service like Resend, SendGrid, or Nodemailer
    // to send a notification to your personal email.
    // Example: await sendEmail({ to: 'your-email@gmail.com', subject: 'New Contact Form Submission', body: message });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to save message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
