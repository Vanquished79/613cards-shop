'use client';

import { useState } from 'react';
import { replyToTicket, toggleTicketStatus, deleteTicket } from '../actions';
import { useRouter } from 'next/navigation';

export function ReplyForm({ ticketId }: { ticketId: number }) {
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSending(true);
    const res = await replyToTicket(ticketId, reply);
    setIsSending(false);

    if (res.success) {
      setReply('');
    } else {
      alert(res.error || 'Failed to send reply');
    }
  }

  async function handleClose() {
    if (confirm('Are you sure you want to mark this ticket as resolved?')) {
      await toggleTicketStatus(ticketId, 'RESOLVED');
    }
  }

  async function handleDelete() {
    if (confirm('Are you sure you want to completely delete this ticket and all history?')) {
      await deleteTicket(ticketId);
      router.push('/admin/messages');
    }
  }

  return (
    <div>
      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <textarea 
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply to the customer here..."
          required
          rows={6}
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            background: 'rgba(0,0,0,0.2)',
            color: 'white',
            outline: 'none',
            fontSize: '15px',
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={handleClose}
              style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.2)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Mark as Resolved
            </button>
            <button 
              type="button" 
              onClick={handleDelete}
              style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(255, 100, 100, 0.1)', color: '#ff8080', border: '1px solid rgba(255, 100, 100, 0.2)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Delete Ticket
            </button>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSending}
            style={{ padding: '12px 24px', borderRadius: '8px', fontSize: '15px' }}
          >
            {isSending ? 'Sending...' : 'Send Reply via Email'}
          </button>
        </div>
      </form>
    </div>
  );
}
