'use server';

import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 1. Save to local database as the reliable backup
    await prisma.waitlistSubscriber.create({
      data: { email: email.toLowerCase() }
    });

    // 2. Integrate with Resend (if API key exists)
    if (process.env.RESEND_API_KEY) {
      
      // A) Add to Resend Audience List (if Audience ID exists in env)
      if (process.env.RESEND_AUDIENCE_ID) {
        try {
          await resend.contacts.create({
            email: email.toLowerCase(),
            audienceId: process.env.RESEND_AUDIENCE_ID,
          });
        } catch (contactError) {
          console.error('Resend Contacts Error:', contactError);
          // Non-fatal, we continue to send the email
        }
      }

      // B) Send the Welcome Email automatically
      try {
        const { error: emailError } = await resend.emails.send({
          from: '613cards <info@613cards.online>',
          to: email.toLowerCase(),
          subject: 'Welcome to the 613cards Waitlist!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1c152a;">
              <h1 style="color: #ffb703;">You're on the list!</h1>
              <p>Hey there,</p>
              <p>Thanks for joining the waitlist for <strong>613cards.com</strong>! We are working hard behind the scenes to bring you the ultimate trading card shop.</p>
              <p>We'll notify you the moment we launch so you can get first access to our exclusive drops and inventory.</p>
              <br/>
              <p>Best regards,</p>
              <p><strong>The 613cards Team</strong></p>
            </div>
          `
        });

        if (emailError) {
          console.error('Resend API rejected the email:', emailError);
        }
      } catch (exception) {
        console.error('Resend Network Error:', exception);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Waitlist error:', error);
    return { success: false, error: 'Failed to join waitlist. Please try again.' };
  }
}
