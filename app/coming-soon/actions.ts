'use server';

import prisma from '@/lib/prisma';

export async function submitWaitlist(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const existing = await prisma.waitlistSubscriber.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existing) {
      return { success: false, error: 'You are already on the waitlist!' };
    }

    await prisma.waitlistSubscriber.create({
      data: { email: email.toLowerCase() }
    });

    return { success: true };
  } catch (error) {
    console.error('Waitlist error:', error);
    return { success: false, error: 'Failed to join waitlist. Please try again.' };
  }
}
