import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

// Helper to determine if we should actually send or just mock it locally
const canSend = !!process.env.RESEND_API_KEY;

export async function sendOrderConfirmation(email: string, customerName: string, orderId: number, total: number) {
  if (!canSend) {
    console.log(`[Email Mock] Order confirmation for Order #${orderId} would be sent to ${email}`);
    return;
  }

  try {
    await resend.emails.send({
      from: '613cards <orders@613cards.com>',
      to: email,
      subject: `Order Confirmation #${orderId} - 613cards`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Thank you for your order, ${customerName}!</h2>
          <p>We've received your order <strong>#${orderId}</strong> for <strong>$${total.toFixed(2)}</strong>.</p>
          <p>We are currently processing it and will notify you as soon as it ships.</p>
          <br/>
          <p>Best regards,<br/>The 613cards Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

export async function sendAdminNotification(subject: string, text: string) {
  if (!canSend) {
    console.log(`[Email Mock] Admin Notification: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      // You should verify this sender domain in Resend, or use onboarding@resend.dev for testing
      from: 'System <notifications@613cards.com>', 
      to: process.env.ADMIN_USERNAME || 'admin@613cards.com', // Sends to admin email
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}
