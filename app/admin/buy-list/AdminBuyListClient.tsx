'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBuyListClient({ initialSubmissions }: { initialSubmissions: any[] }) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/buy-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (submissions.length === 0) {
    return <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>No submissions found.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {submissions.map(sub => (
        <div key={sub.id} className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>Submission #{sub.id}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>From: {sub.user.name} ({sub.user.email})</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Date: {new Date(sub.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', marginBottom: '8px' }}>
                Status: {sub.status}
              </div>
              <select 
                value={sub.status} 
                onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)' }}
              >
                <option value="PENDING">Pending</option>
                <option value="REVIEWING">Reviewing</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {sub.notes && (
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
              <strong>User Notes:</strong>
              <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)' }}>{sub.notes}</p>
            </div>
          )}

          <h4 style={{ margin: '0 0 16px 0' }}>Cards ({sub.items.length})</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '8px 4px' }}>Card</th>
                <th style={{ padding: '8px 4px' }}>Series</th>
                <th style={{ padding: '8px 4px' }}>Condition</th>
                <th style={{ padding: '8px 4px' }}>Graded</th>
                <th style={{ padding: '8px 4px' }}>Qty</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Expected</th>
              </tr>
            </thead>
            <tbody>
              {sub.items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>{item.cardName}</td>
                  <td style={{ padding: '12px 4px', color: 'var(--text-muted)' }}>{item.cardSeries || '-'}</td>
                  <td style={{ padding: '12px 4px', color: 'var(--text-muted)' }}>{item.condition}</td>
                  <td style={{ padding: '12px 4px', color: 'var(--text-muted)' }}>
                    {item.isGraded ? <span style={{ color: '#4ade80' }}>Yes ({item.gradingCompany} {item.grade})</span> : 'No'}
                  </td>
                  <td style={{ padding: '12px 4px' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 4px', textAlign: 'right', color: 'var(--accent-color)' }}>
                    {item.expectedPrice ? `$${item.expectedPrice.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      ))}
    </div>
  );
}
