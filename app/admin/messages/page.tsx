import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' }
  });

  async function markAsRead(formData: FormData) {
    'use server';
    const id = parseInt(formData.get('id') as string);
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true }
    });
    revalidatePath('/admin/messages');
  }

  async function deleteMessage(formData: FormData) {
    'use server';
    const id = parseInt(formData.get('id') as string);
    await prisma.contactMessage.delete({ where: { id } });
    revalidatePath('/admin/messages');
  }

  return (
    <div style={{ padding: '28px' }} className="glass-panel">
      <h1 style={{ marginBottom: '24px' }}>Contact Messages</h1>
      
      {messages.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No messages yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg: any) => (
            <div key={msg.id} style={{ 
              background: msg.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(138, 43, 226, 0.1)', 
              padding: '20px', 
              borderRadius: '12px', 
              border: `1px solid ${msg.isRead ? 'var(--glass-border)' : 'var(--accent-color)'}` 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {msg.name} 
                    {!msg.isRead && <span style={{ background: '#ff6b6b', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>NEW</span>}
                  </h3>
                  <a href={`mailto:${msg.email}`} style={{ color: 'var(--accent-color)', fontSize: '14px', textDecoration: 'none' }}>{msg.email}</a>
                </div>
                <div style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '12px' }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                {msg.message}
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {!msg.isRead && (
                  <form action={markAsRead}>
                    <input type="hidden" name="id" value={msg.id} />
                    <button type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: '13px' }}>Mark as Read</button>
                  </form>
                )}
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={msg.id} />
                  <button type="submit" style={{ padding: '6px 16px', fontSize: '13px', background: 'rgba(255,100,100,0.1)', color: '#ff8080', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
