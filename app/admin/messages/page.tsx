import prisma from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const resolvedParams = await searchParams;
  const currentStatus = resolvedParams.status || 'OPEN';

  const messages = await prisma.contactMessage.findMany({
    where: { status: currentStatus },
    orderBy: { createdAt: 'desc' },
    include: { replies: true }
  });

  const openCount = await prisma.contactMessage.count({ where: { status: 'OPEN' } });
  const resolvedCount = await prisma.contactMessage.count({ where: { status: 'RESOLVED' } });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Support <span style={{ color: 'var(--accent-color)' }}>Tickets</span></h1>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px' }}>
          <Link href="/admin/messages?status=OPEN" style={{
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            color: currentStatus === 'OPEN' ? 'white' : 'var(--text-muted)',
            background: currentStatus === 'OPEN' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}>
            Open ({openCount})
          </Link>
          <Link href="/admin/messages?status=RESOLVED" style={{
            padding: '8px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold',
            color: currentStatus === 'RESOLVED' ? 'white' : 'var(--text-muted)',
            background: currentStatus === 'RESOLVED' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}>
            Resolved ({resolvedCount})
          </Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0' }}>
        {messages.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No {currentStatus.toLowerCase()} tickets found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Customer</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Message Preview</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Replies</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: !msg.isRead && currentStatus === 'OPEN' ? 'rgba(138, 43, 226, 0.1)' : 'transparent'
                }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {msg.name}
                      {!msg.isRead && currentStatus === 'OPEN' && (
                        <span style={{ background: '#ff6b6b', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>NEW</span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{msg.email}</div>
                  </td>
                  <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                    <Link href={`/admin/messages/${msg.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-muted)' }}>
                        {msg.message}
                      </div>
                    </Link>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                    {msg.replies.length}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    {msg.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
