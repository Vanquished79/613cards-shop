'use server';

import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import logoImg from '../../public/brand-icon.png';

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
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Welcome to 613cards</title>
  <style>
    /* Force dark mode colors to persist even if mail client tries to auto-invert */
    :root {
      color-scheme: light dark;
    }
    @media (prefers-color-scheme: dark) {
      .body-bg { background-color: #0a0118 !important; }
      .card-bg { background-color: #1a0b2e !important; border-color: #302048 !important; }
      .text-main { color: #ffffff !important; }
      .text-muted { color: #a1a1aa !important; }
      .text-accent { color: #ffb703 !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #0a0118; color: #ffffff; text-align: center;">
  <div class="body-bg" style="background-color: #0a0118; padding: 40px 20px;">
    <div class="card-bg" style="max-width: 600px; margin: 0 auto; background-color: #1a0b2e; border: 1px solid #302048; border-radius: 16px; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
      <img src="https://613cards.online${logoImg.src}" alt="613cards.online Logo" style="width: 200px; margin-bottom: 20px;" />
      
      <h1 class="text-accent" style="color: #ffb703; font-size: 28px; margin-top: 0;">You're on the list!</h1>
      
      <p class="text-muted" style="font-size: 16px; color: #a1a1aa; line-height: 1.6; text-align: left;">Hey there,</p>
      <p class="text-muted" style="font-size: 16px; color: #a1a1aa; line-height: 1.6; text-align: left;">
        Thanks for joining the waitlist for <strong class="text-main" style="color: #ffffff;">613cards.online</strong>! We are working hard behind the scenes to bring you the ultimate trading card shop.
      </p>
      <p class="text-muted" style="font-size: 16px; color: #a1a1aa; line-height: 1.6; text-align: left;">
        We'll notify you the moment we launch so you can get first access to our exclusive drops and inventory.
      </p>
      
      <div class="card-bg" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #302048; text-align: left;">
        <p class="text-accent" style="font-size: 14px; color: #ffb703; margin: 0;"><strong>The 613cards Team</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
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
