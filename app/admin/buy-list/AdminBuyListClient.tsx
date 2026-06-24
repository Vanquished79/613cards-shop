'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/ModalProvider';
import { toast } from 'react-hot-toast';

export default function AdminBuyListClient({ initialSubmissions }: { initialSubmissions: any[] }) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const { confirm } = useModal();

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/buy-list/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Error updating status');
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
                Status: {sub.status.replace(/_/g, ' ')}
              </div>
              <select 
                value={sub.status} 
                onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)' }}
              >
                <option value="PENDING" style={{ background: '#1a1025' }}>Pending</option>
                <option value="REVIEWING" style={{ background: '#1a1025' }}>Reviewing</option>
                <option value="OFFER_MADE" style={{ background: '#1a1025' }}>Offer Made</option>
                <option value="ACCEPTED" style={{ background: '#1a1025' }}>Accepted</option>
                <option value="REJECTED" style={{ background: '#1a1025' }}>Rejected</option>
                <option value="COMPLETED" style={{ background: '#1a1025' }}>Completed</option>
              </select>
            </div>
          </div>
          
          {(sub.status === 'PENDING' || sub.status === 'REVIEWING') && (
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Cash Offer ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  id={`cashOffer-${sub.id}`}
                  defaultValue={sub.cashOffer || ''}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Store Credit Offer ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  id={`creditOffer-${sub.id}`}
                  defaultValue={sub.creditOffer || ''}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid var(--glass-border)' }}
                />
              </div>
              <button 
                onClick={async () => {
                  const cashInput = document.getElementById(`cashOffer-${sub.id}`) as HTMLInputElement;
                  const creditInput = document.getElementById(`creditOffer-${sub.id}`) as HTMLInputElement;
                  const cashOffer = parseFloat(cashInput.value);
                  const creditOffer = parseFloat(creditInput.value);
                  if (isNaN(cashOffer) || isNaN(creditOffer)) return toast.error('Please enter valid numbers');
                  
                  try {
                    const res = await fetch(`/api/admin/buy-list/${sub.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: 'OFFER_MADE', cashOffer, creditOffer })
                    });
                    if (!res.ok) throw new Error('Failed');
                    setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, status: 'OFFER_MADE', cashOffer, creditOffer } : s));
                    toast.success('Offer sent to customer!');
                  } catch (err) {
                    toast.error('Error saving offer');
                  }
                }}
                style={{ padding: '8px 16px', borderRadius: '4px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', height: 'fit-content' }}
              >
                Send Offer
              </button>
            </div>
          )}

          {sub.status === 'OFFER_MADE' && (
            <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', marginBottom: '24px' }}>
              <strong>Offer Sent to Customer:</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>Cash: ${sub.cashOffer?.toFixed(2)} | Store Credit: ${sub.creditOffer?.toFixed(2)}</span>
            </div>
          )}

          {sub.status === 'ACCEPTED' && (
            <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '8px', marginBottom: '24px' }}>
              <strong>Customer Accepted!</strong><br/>
              <span style={{ color: 'var(--text-muted)' }}>
                Payout Method: {sub.payoutMethod} <br/>
                {sub.payoutMethod === 'PAYPAL' && `PayPal Email: ${sub.paypalEmail}`}
                {sub.payoutMethod === 'STORE_CREDIT' && `Store Credit Amount: $${sub.creditOffer?.toFixed(2)}`}
              </span>
              <div style={{ marginTop: '12px' }}>
                <button 
                  onClick={async () => {
                    const isConfirmed = await confirm({ title: 'Complete Payout', message: 'Have you physically received the cards and verified them? Clicking Confirm will issue the payout and mark as COMPLETED.' });
                    if (!isConfirmed) return;
                    try {
                      const res = await fetch(`/api/admin/buy-list/${sub.id}/complete`, { method: 'POST' });
                      if (!res.ok) throw new Error('Failed');
                      setSubmissions(submissions.map(s => s.id === sub.id ? { ...s, status: 'COMPLETED' } : s));
                      toast.success('Payout issued and status completed!');
                    } catch (err) {
                      toast.error('Error completing payout');
                    }
                  }}
                  style={{ padding: '6px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Mark Received & Issue Payout
                </button>
              </div>
            </div>
          )}

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
                  <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.imageUrl && (
                        <a href={item.imageUrl} target="_blank" rel="noreferrer">
                          <img src={item.imageUrl} alt={item.cardName} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                        </a>
                      )}
                      <span>{item.cardName}</span>
                    </div>
                  </td>
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
