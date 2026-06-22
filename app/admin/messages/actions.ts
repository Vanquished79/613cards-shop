'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const canSend = !!process.env.RESEND_API_KEY;

export async function replyToTicket(ticketId: number, replyBody: string, adminName: string = "Admin") {
  const ticket = await prisma.contactMessage.findUnique({ where: { id: ticketId } });
  if (!ticket) return { success: false, error: 'Ticket not found' };

  // Save reply to database
  const reply = await prisma.ticketReply.create({
    data: {
      messageId: ticketId,
      body: replyBody,
      isAdmin: true,
    }
  });

  // Mark ticket as read if it wasn't
  if (!ticket.isRead) {
    await prisma.contactMessage.update({
      where: { id: ticketId },
      data: { isRead: true }
    });
  }

  // Send email to customer via Resend
  if (canSend) {
    try {
      await resend.emails.send({
        from: '613cards Support <info@613cards.online>',
        to: ticket.email,
        replyTo: 'info@613cards.online',
        subject: `Re: Your message to 613cards`,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0a0118; padding: 40px 20px; color: #ffffff;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a0b2e; border: 1px solid #302048; border-radius: 16px; padding: 40px 30px;">
              <h2 style="color: #ffb703; margin-top: 0;">Reply from 613cards</h2>
              <p style="color: #a1a1aa; line-height: 1.6;">Hi ${ticket.name},</p>
              
              <div style="background-color: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0; color: #ffffff; white-space: pre-wrap; font-size: 16px;">${replyBody}</div>
              
              <p style="color: #a1a1aa; line-height: 1.6;">If you have any other questions, you can simply reply directly to this email.</p>
              <br/>
              <p style="color: #ffb703; margin: 0;"><strong>${adminName}</strong></p>
              <p style="color: #a1a1aa; margin: 0; font-size: 14px;">The 613cards Team</p>
              
              <hr style="border: none; border-top: 1px solid #302048; margin: 30px 0;" />
              <p style="color: #666; font-size: 12px;">On ${ticket.createdAt.toLocaleDateString()}, you wrote:</p>
              <blockquote style="color: #888; border-left: 2px solid #302048; margin: 0; padding-left: 10px; font-size: 13px;">${ticket.message}</blockquote>
            </div>
          </div>
        `
      });
    } catch (e) {
      console.error('Failed to send reply email:', e);
    }
  }

  revalidatePath(`/admin/messages/${ticketId}`);
  revalidatePath('/admin/messages');
  return { success: true };
}

export async function toggleTicketStatus(ticketId: number, status: string) {
  await prisma.contactMessage.update({
    where: { id: ticketId },
    data: { status }
  });
  revalidatePath(`/admin/messages/${ticketId}`);
  revalidatePath('/admin/messages');
  return { success: true };
}

export async function deleteTicket(ticketId: number) {
  await prisma.contactMessage.delete({
    where: { id: ticketId }
  });
  revalidatePath('/admin/messages');
  return { success: true };
}
