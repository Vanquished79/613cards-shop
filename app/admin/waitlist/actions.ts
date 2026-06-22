'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function removeSubscriber(id: number, email: string) {
  try {
    // 1. Remove from local database
    await prisma.waitlistSubscriber.delete({
      where: { id }
    });

    // 2. Remove from Resend Audience (if configured)
    if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
      try {
        await resend.contacts.remove({
          email: email.toLowerCase(),
          audienceId: process.env.RESEND_AUDIENCE_ID,
        });
      } catch (contactError) {
        console.error('Failed to remove from Resend Contacts:', contactError);
      }
    }

    revalidatePath('/admin/waitlist');
    return { success: true };
  } catch (error) {
    console.error('Failed to remove subscriber:', error);
    return { success: false, error: 'Failed to remove subscriber' };
  }
}
