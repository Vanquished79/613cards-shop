import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function WaitlistPage() {
  const subscribers = await prisma.waitlistSubscriber.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const emailList = subscribers.map(s => s.email).join(', ');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>Waitlist <span style={{ color: 'var(--accent-color)' }}>Subscribers</span></h1>
        
        {subscribers.length > 0 && (
          <CopyEmailsButton emailList={emailList} />
        )}
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        {subscribers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No one has signed up for the waitlist yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Email Address</th>
                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Date Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 0', fontWeight: '500' }}>{sub.email}</td>
                  <td style={{ padding: '16px 0', color: 'var(--text-muted)' }}>
                    {sub.createdAt.toLocaleDateString()} at {sub.createdAt.toLocaleTimeString()}
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

// Client component for the copy button
import { CopyEmailsButton } from './CopyButton';
