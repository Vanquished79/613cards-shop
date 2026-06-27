'use client';

import { useState } from 'react';
import { replyToTicket, toggleTicketStatus, deleteTicket } from '../actions';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/ModalProvider';
import { toast } from 'react-hot-toast';

export function ReplyForm({ ticketId }: { ticketId: number }) {
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const { confirm } = useModal();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSending(true);
    const res = await replyToTicket(ticketId, reply);
    setIsSending(false);

    if (res.success) {
      setReply('');
    } else {
      toast.error(res.error || 'Failed to send reply');
    }
  }

  async function handleClose() {
    const isConfirmed = await confirm({ title: 'Resolve Ticket', message: 'Are you sure you want to mark this ticket as resolved?' });
    if (isConfirmed) {
      await toggleTicketStatus(ticketId, 'RESOLVED');
      toast.success('Ticket marked as resolved');
    }
  }

  async function handleDelete() {
    const isConfirmed = await confirm({ title: 'Delete Ticket', message: 'Are you sure you want to completely delete this ticket and all history?' });
    if (isConfirmed) {
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
            background: '#ffffff',
            color: 'var(--text-main)',
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
              style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--text-success)', border: '1px solid var(--text-success)', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Mark as Resolved
            </button>
            <button 
              type="button" 
              onClick={handleDelete}
              style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--text-error)', border: '1px solid var(--text-error)', cursor: 'pointer', fontWeight: 'bold' }}
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
