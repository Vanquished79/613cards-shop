import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReplyForm } from './ReplyForm';

export const dynamic = 'force-dynamic';

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticketId = parseInt(params.id);
  
  const ticket = await prisma.contactMessage.findUnique({
    where: { id: ticketId },
    include: { replies: { orderBy: { createdAt: 'asc' } } }
  });

  if (!ticket) {
    redirect('/admin/messages');
  }

  // Mark as read if not already
  if (!ticket.isRead) {
    await prisma.contactMessage.update({
      where: { id: ticketId },
      data: { isRead: true }
    });
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/admin/messages" style={{ color: 'var(--accent-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          &larr; Back to Tickets
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Ticket #{ticket.id}</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            From: <span style={{ color: 'white' }}>{ticket.name}</span> ({ticket.email}) &bull; {ticket.createdAt.toLocaleString()}
          </div>
        </div>
        <div>
          <span style={{ 
            padding: '6px 12px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 'bold',
            background: ticket.status === 'OPEN' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.1)',
            color: ticket.status === 'OPEN' ? '#4ade80' : 'var(--text-muted)',
            border: \`1px solid \${ticket.status === 'OPEN' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255, 255, 255, 0.2)'}\`
          }}>
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Original Message</h3>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '16px' }}>
          {ticket.message}
        </div>
      </div>

      {ticket.replies.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Reply History</h3>
          {ticket.replies.map(reply => (
            <div key={reply.id} style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '24px',
              marginLeft: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <strong>{reply.isAdmin ? 'Admin Reply' : 'Customer Reply'}</strong>
                <span>{reply.createdAt.toLocaleString()}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px' }}>
                {reply.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {ticket.status === 'OPEN' ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Send a Reply</h3>
          <ReplyForm ticketId={ticket.id} />
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--glass-border)' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>This ticket is marked as resolved.</p>
        </div>
      )}
    </div>
  );
}
