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
      from: '613cards <orders@613cards.online>',
      to: email,
      subject: `Order Confirmation #${orderId} - 613cards`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0a0118; padding: 40px 20px; color: #ffffff; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a0b2e; border: 1px solid #302048; border-radius: 16px; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <h2 style="color: #ffb703; margin-top: 0;">Thank you for your order, ${customerName}!</h2>
            <p style="color: #a1a1aa; text-align: left;">We've received your order <strong>#${orderId}</strong> for <strong>$${total.toFixed(2)}</strong>.</p>
            <p style="color: #a1a1aa; text-align: left;">We are currently processing it and will notify you as soon as it ships.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #302048; text-align: left;">
              <p style="font-size: 14px; color: #ffb703; margin: 0;"><strong>The 613cards Team</strong></p>
            </div>
          </div>
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
      from: 'System <notifications@613cards.online>', 
      to: process.env.ADMIN_USERNAME || 'admin@613cards.online',
      subject: subject,
      text: text,
    });
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}

export async function sendContactConfirmation(email: string, name: string) {
  if (!canSend) return;

  try {
    await resend.emails.send({
      from: '613cards <info@613cards.online>',
      to: email,
      subject: 'We received your message!',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0a0118; padding: 40px 20px; color: #ffffff; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a0b2e; border: 1px solid #302048; border-radius: 16px; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <img src="https://613cards.online/logo.png" alt="613cards Logo" style="width: 200px; margin-bottom: 20px;" />
            <h1 style="color: #ffb703; font-size: 24px; margin-top: 0;">Message Received!</h1>
            <p style="font-size: 16px; color: #a1a1aa; line-height: 1.6; text-align: left;">Hi ${name},</p>
            <p style="font-size: 16px; color: #a1a1aa; line-height: 1.6; text-align: left;">
              Thanks for reaching out to <strong>613cards.online</strong>. We have received your message and our team will get back to you as soon as possible!
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #302048; text-align: left;">
              <p style="font-size: 14px; color: #ffb703; margin: 0;"><strong>The 613cards Team</strong></p>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send contact confirmation email:', error);
  }
}

export async function sendOrderStatusUpdate(email: string, customerName: string, orderId: number, status: string, trackingNumber?: string | null, carrier?: string | null) {
  if (!canSend) {
    console.log(`[Email Mock] Order status update for Order #${orderId} to ${status}`);
    return;
  }

  let statusMessage = '';
  switch (status) {
    case 'CONFIRMED': statusMessage = 'Your order has been confirmed and we are getting ready to pack it!'; break;
    case 'PACKING': statusMessage = 'Your order is currently being packed!'; break;
    case 'SHIPPED': statusMessage = 'Great news! Your order has shipped.'; break;
    case 'DELIVERED': statusMessage = 'Your order has been delivered! Enjoy your cards!'; break;
    default: statusMessage = `Your order status has been updated to: ${status}`;
  }

  let trackingHtml = '';
  if (trackingNumber) {
    trackingHtml = `
      <div style="margin-top: 20px; padding: 16px; background-color: rgba(255,255,255,0.05); border-radius: 8px;">
        <p style="margin: 0; color: #a1a1aa;">Tracking Number: <strong>${trackingNumber}</strong> ${carrier ? `(${carrier})` : ''}</p>
      </div>
    `;
  }

  try {
    await resend.emails.send({
      from: '613cards <orders@613cards.online>',
      to: email,
      subject: `Order #${orderId} Update - ${status}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #0a0118; padding: 40px 20px; color: #ffffff; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1a0b2e; border: 1px solid #302048; border-radius: 16px; padding: 40px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
            <h2 style="color: #ffb703; margin-top: 0;">Order Update</h2>
            <p style="color: #a1a1aa; text-align: left;">Hi ${customerName},</p>
            <p style="color: #a1a1aa; text-align: left; font-size: 16px;">${statusMessage}</p>
            ${trackingHtml}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #302048; text-align: left;">
              <p style="font-size: 14px; color: #ffb703; margin: 0;"><strong>The 613cards Team</strong></p>
            </div>
          </div>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send order status update email:', error);
  }
}
