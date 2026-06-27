'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/ModalProvider';
import { toast } from 'react-hot-toast';

export default function AdminBuyListClient({ 
  initialSubmissions, 
  initialWantedItems = [] 
}: { 
  initialSubmissions: any[], 
  initialWantedItems?: any[] 
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'active_submissions' | 'archived_submissions' | 'wanted'>('active_submissions');
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [wantedItems, setWantedItems] = useState<any[]>(initialWantedItems);
  const { confirm } = useModal();

  const activeSubmissions = submissions.filter(s => s.status !== 'COMPLETED');
  const archivedSubmissions = submissions.filter(s => s.status === 'COMPLETED');

  // Modal State for Add/Edit Wanted Item
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    series: '',
    price: '',
    isRC: false,
    isGraded: false,
    gradingCompany: 'PSA',
    grade: '10',
    isNumbered: false,
    numberedTo: '',
    parallel: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Submissions status updates
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

  // Open modal for adding
  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      series: '',
      price: '',
      isRC: false,
      isGraded: false,
      gradingCompany: 'PSA',
      grade: '10',
      isNumbered: false,
      numberedTo: '',
      parallel: '',
      isActive: true
    });
    setSelectedFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      series: item.series || '',
      price: item.price ? item.price.toString() : '',
      isRC: item.isRC,
      isGraded: item.isGraded,
      gradingCompany: item.gradingCompany || 'PSA',
      grade: item.grade || '10',
      isNumbered: item.isNumbered,
      numberedTo: item.numberedTo || '',
      parallel: item.parallel || '',
      isActive: item.isActive
    });
    setSelectedFile(null);
    setImagePreview(item.imageUrl || null);
    setShowModal(true);
  };

  // Handle Wanted Item Delete
  const handleDeleteWanted = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Delete Wanted Card',
      message: 'Are you sure you want to delete this card from the wanted catalog?'
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/buy-list/wanted?id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      
      setWantedItems(wantedItems.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (err) {
      toast.error('Error deleting item');
    }
  };

  // Handle Wanted Item Save (Create or Update)
  const handleSaveWanted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return toast.error('Name is required');
    
    setIsSaving(true);
    try {
      const form = new FormData();
      if (editingItem) {
        form.append('id', editingItem.id.toString());
      }
      form.append('name', formData.name);
      form.append('series', formData.series);
      form.append('price', formData.price);
      form.append('isRC', formData.isRC.toString());
      form.append('isGraded', formData.isGraded.toString());
      form.append('gradingCompany', formData.isGraded ? formData.gradingCompany : '');
      form.append('grade', formData.isGraded ? formData.grade : '');
      form.append('isNumbered', formData.isNumbered.toString());
      form.append('numberedTo', formData.isNumbered ? formData.numberedTo : '');
      form.append('parallel', formData.parallel);
      form.append('isActive', formData.isActive.toString());

      if (selectedFile) {
        form.append('image', selectedFile);
      } else if (editingItem && !imagePreview && editingItem.imageUrl) {
        form.append('removeImage', 'true');
      }

      const method = editingItem ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/buy-list/wanted', {
        method,
        body: form
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save');
      }

      const savedItem = await res.json();

      if (editingItem) {
        setWantedItems(wantedItems.map(item => item.id === savedItem.id ? savedItem : item));
        toast.success('Item updated');
      } else {
        setWantedItems([savedItem, ...wantedItems]);
        toast.success('Item added to catalog');
      }
      
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error saving wanted item');
    } finally {
      setIsSaving(false);
    }
  };

  // File selection change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const labelStyle = { 
    display: 'block', 
    marginBottom: '6px', 
    fontSize: '13px', 
    color: 'var(--text-muted)' 
  };

  const CompsViewer = ({ query }: { query: string }) => {
    const [comps, setComps] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    if (!query) return null;

    if (!comps && !loading) {
      return (
        <button 
          onClick={async () => {
            setLoading(true);
            try {
              const res = await fetch(`/api/comps?q=${encodeURIComponent(query)}`);
              const data = await res.json();
              setComps(data);
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.5)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}
        >
          🔍 Load Market Comps (eBay)
        </button>
      );
    }

    if (loading) {
      return <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}><span style={{ animation: 'spin 1s linear infinite' }}>↻</span> Loading comps...</div>;
    }

    if (comps && comps.recentSales) {
      return (
        <div style={{ marginTop: '8px', padding: '12px', background: 'var(--glass-bg)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Live Market Data</span>
            <span style={{ color: 'var(--text-muted)' }}>Avg: <strong style={{ color: 'var(--text-main)' }}>${comps.averagePrice}</strong> | Range: ${comps.lowPrice} - ${comps.highPrice}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {comps.recentSales.slice(0,3).map((sale: any) => (
              <div key={sale.id} style={{ background: 'rgba(0,0,0,0.03)', padding: '6px 8px', borderRadius: '4px', minWidth: '120px', fontSize: '11px' }}>
                <div style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '2px' }}>${sale.price.toFixed(2)}</div>
                <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={sale.title}>{sale.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '10px', marginTop: '2px' }}>{sale.soldDate}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const inputStyle = { 
    width: '100%', 
    padding: '10px 14px', 
    borderRadius: '8px', 
    border: '1px solid var(--glass-border)', 
    background: '#ffffff', 
    color: 'var(--text-main)',
    boxSizing: 'border-box' as const
  };

  const renderSubmissions = (list: any[]) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {list.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>No submissions found.</div>
        ) : (
          list.map(sub => (
            <div key={sub.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0' }}>Submission #{sub.id}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    From: {sub.user.name} ({sub.user.email})
                    <span style={{ 
                      fontSize: '11px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold',
                      background: sub.user.vipTier === 'OBSIDIAN' ? 'rgba(168, 85, 247, 0.2)' : sub.user.vipTier === 'GOLD' ? 'rgba(234, 179, 8, 0.2)' : sub.user.vipTier === 'SILVER' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0,0,0,0.05)',
                      color: sub.user.vipTier === 'OBSIDIAN' ? '#7c3aed' : sub.user.vipTier === 'GOLD' ? '#a16207' : sub.user.vipTier === 'SILVER' ? '#64748b' : 'var(--text-main)',
                      border: `1px solid ${sub.user.vipTier === 'OBSIDIAN' ? '#a855f7' : sub.user.vipTier === 'GOLD' ? '#eab308' : sub.user.vipTier === 'SILVER' ? '#94a3b8' : 'var(--glass-border)'}`
                    }}>
                      {sub.user.vipTier || 'MEMBER'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Date: {new Date(sub.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--text-accent)', marginBottom: '8px' }}>
                    Status: {sub.status.replace(/_/g, ' ')}
                  </div>
                  <select 
                    value={sub.status} 
                    onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '4px', background: '#ffffff', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                  >
                    <option value="PENDING" style={{ background: '#ffffff' }}>Pending</option>
                    <option value="REVIEWING" style={{ background: '#ffffff' }}>Reviewing</option>
                    <option value="OFFER_MADE" style={{ background: '#ffffff' }}>Offer Made</option>
                    <option value="ACCEPTED" style={{ background: '#ffffff' }}>Accepted</option>
                    <option value="REJECTED" style={{ background: '#ffffff' }}>Rejected</option>
                    <option value="COMPLETED" style={{ background: '#ffffff' }}>Completed</option>
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
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#ffffff', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      Store Credit Offer ($)
                      {sub.user.vipTier === 'SILVER' && <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '12px' }}>(Suggest +2% Bonus)</span>}
                      {sub.user.vipTier === 'GOLD' && <span style={{ color: '#eab308', marginLeft: '8px', fontSize: '12px' }}>(Suggest +5% Bonus)</span>}
                      {sub.user.vipTier === 'OBSIDIAN' && <span style={{ color: '#a855f7', marginLeft: '8px', fontSize: '12px' }}>(Suggest +10% Bonus)</span>}
                    </label>
                    <input 
                      type="number" 
                      step="0.01" 
                      id={`creditOffer-${sub.id}`}
                      defaultValue={sub.creditOffer || ''}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#ffffff', color: 'var(--text-main)', border: '1px solid var(--glass-border)' }}
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
                <div style={{ padding: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', marginBottom: '24px', fontSize: '14px' }}>
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
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '12px 4px', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.imageUrls && item.imageUrls.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {item.imageUrls.map((url: string, idx: number) => (
                                <a key={idx} href={url} target="_blank" rel="noreferrer" title={`Click to view full image ${idx + 1}`}>
                                  <img src={url} alt={`${item.cardName} ${idx + 1}`} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                                </a>
                              ))}
                            </div>
                          ) : item.imageUrl ? (
                            <a href={item.imageUrl} target="_blank" rel="noreferrer">
                              <img src={item.imageUrl} alt={item.cardName} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                            </a>
                          ) : null}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{item.cardName}</span>
                            {item.aiGradeEstimate && (
                              <div style={{ fontSize: '11px', color: '#e9d5ff', marginTop: '4px', background: 'rgba(168, 85, 247, 0.2)', padding: '2px 6px', borderRadius: '4px', width: 'fit-content', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                                ✨ AI Est: {item.aiGradeEstimate} ({item.aiCentering})
                              </div>
                            )}
                            {(sub.status === 'PENDING' || sub.status === 'REVIEWING') && (
                              <CompsViewer query={`${item.cardName} ${item.cardSeries || ''}`} />
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 4px', color: 'var(--text-muted)' }}>{item.cardSeries || '-'}</td>
                      <td style={{ padding: '12px 4px', color: 'var(--text-muted)' }}>{item.condition}</td>
                      <td style={{ padding: '12px 4px', color: 'var(--text-muted)' }}>
                        {item.isGraded ? <span style={{ color: '#4ade80' }}>Yes ({item.gradingCompany} {item.grade})</span> : 'No'}
                      </td>
                      <td style={{ padding: '12px 4px' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 4px', textAlign: 'right', color: 'var(--text-accent)' }}>
                        {item.expectedPrice ? `$${item.expectedPrice.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('active_submissions')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'active_submissions' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'active_submissions' ? 'bold' : 'normal',
            borderBottom: activeTab === 'active_submissions' ? '2px solid var(--accent-color)' : '2px solid transparent',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          Active Submissions ({activeSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('archived_submissions')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'archived_submissions' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'archived_submissions' ? 'bold' : 'normal',
            borderBottom: activeTab === 'archived_submissions' ? '2px solid var(--accent-color)' : '2px solid transparent',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          Archived Submissions ({archivedSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('wanted')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'wanted' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'wanted' ? 'bold' : 'normal',
            borderBottom: activeTab === 'wanted' ? '2px solid var(--accent-color)' : '2px solid transparent',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          Wanted Catalog ({wantedItems.length})
        </button>
      </div>

      {/* Active Submissions Tab View */}
      {activeTab === 'active_submissions' && renderSubmissions(activeSubmissions)}

      {/* Archived Submissions Tab View */}
      {activeTab === 'archived_submissions' && renderSubmissions(archivedSubmissions)}

      {/* Wanted Catalog Tab View */}
      {activeTab === 'wanted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Cards We're Looking For</h2>
            <button 
              onClick={handleAddClick}
              className="btn-primary" 
              style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}
            >
              + Add Wanted Card
            </button>
          </div>

          {/* Catalog Grid */}
          {wantedItems.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No cards added to the wanted catalog yet. Click "+ Add Wanted Card" above to list items you're looking for.
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              {wantedItems.map(item => (
                <div 
                  key={item.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    opacity: item.isActive ? 1 : 0.6,
                    position: 'relative'
                  }}
                >
                  {/* Status Badge */}
                  {!item.isActive && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      background: 'rgba(239, 68, 68, 0.2)', 
                      border: '1px solid #ef4444', 
                      color: '#f87171', 
                      fontSize: '11px', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      zIndex: 2
                    }}>
                      Inactive
                    </span>
                  )}

                  {/* Card Main Info */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {/* Card Image */}
                    <div style={{ width: '80px', height: '112px', flexShrink: 0, background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '24px', color: 'var(--text-muted)' }}>🃏</span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                        {item.name}
                      </h4>
                      {item.series && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.series}
                        </span>
                      )}
                      
                      {/* Price tag */}
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Offering:</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-accent)' }}>
                          {item.price ? `$${item.price.toFixed(2)}` : 'Contact for Price'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Attribute badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '22px' }}>
                    {item.isRC && (
                      <span style={{ background: 'rgba(234, 179, 8, 0.15)', border: '1px solid #eab308', color: '#fef08a', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        RC
                      </span>
                    )}
                    {item.isGraded && (
                      <span style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', color: '#bbf7d0', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.gradingCompany} {item.grade}
                      </span>
                    )}
                    {item.isNumbered && (
                      <span style={{ background: 'rgba(6, 182, 212, 0.15)', border: '1px solid #06b6d4', color: '#c5f2f7', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                        /{item.numberedTo}
                      </span>
                    )}
                    {item.parallel && (
                      <span style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#e9d5ff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.parallel}
                      </span>
                    )}
                  </div>

                  {/* Item Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                    <button 
                      onClick={() => handleEditClick(item)}
                      style={{ 
                        flex: 1, 
                        padding: '6px 12px', 
                        background: 'rgba(0,0,0,0.03)', 
                        border: '1px solid var(--glass-border)', 
                        color: 'var(--text-main)', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                    >
                      Edit Details
                    </button>
                    <button 
                      onClick={() => handleDeleteWanted(item.id)}
                      style={{ 
                        padding: '6px 12px', 
                        background: 'rgba(239, 68, 68, 0.15)', 
                        border: '1px solid #ef4444', 
                        color: '#f87171', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '12px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* custom-styled Glassmorphism Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>{editingItem ? 'Edit Wanted Card' : 'Add Card We\'re Buying'}</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveWanted} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={labelStyle}>Card Title / Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Connor Bedard Young Guns"
                  required
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Set / Series</label>
                  <input 
                    type="text" 
                    value={formData.series} 
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    placeholder="e.g. 2023-24 Upper Deck S2"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Buy Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 150.00"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Attributes Toggle Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '12px', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.03)' }}>
                {/* RC and Numbered */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isRC} 
                      onChange={(e) => setFormData({ ...formData, isRC: e.target.checked })} 
                    />
                    Rookie Card (RC)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isNumbered} 
                      onChange={(e) => setFormData({ ...formData, isNumbered: e.target.checked })} 
                    />
                    Serial Numbered
                  </label>

                  {formData.isNumbered && (
                    <input 
                      type="text" 
                      value={formData.numberedTo}
                      onChange={(e) => setFormData({ ...formData, numberedTo: e.target.value })}
                      placeholder="e.g. 99"
                      style={{ ...inputStyle, padding: '6px 10px', fontSize: '13px' }}
                    />
                  )}
                </div>

                {/* Graded info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.isGraded} 
                      onChange={(e) => setFormData({ ...formData, isGraded: e.target.checked })} 
                    />
                    Graded Card
                  </label>

                  {formData.isGraded && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select 
                        value={formData.gradingCompany}
                        onChange={(e) => setFormData({ ...formData, gradingCompany: e.target.value })}
                        style={{ ...inputStyle, padding: '6px 8px', fontSize: '13px' }}
                      >
                        <option value="PSA">PSA</option>
                        <option value="BGS">BGS</option>
                        <option value="SGC">SGC</option>
                        <option value="CGC">CGC</option>
                      </select>
                      <input 
                        type="text" 
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        placeholder="Grade (e.g. 10)"
                        style={{ ...inputStyle, padding: '6px 8px', fontSize: '13px' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Parallel / Variation Name</label>
                <input 
                  type="text" 
                  value={formData.parallel} 
                  onChange={(e) => setFormData({ ...formData, parallel: e.target.value })}
                  placeholder="e.g. Gold Refractor, Red Wave, Base, SSP"
                  style={inputStyle}
                />
              </div>

              {/* Image Upload Block */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ width: '70px', height: '98px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '20px', color: 'var(--text-muted)' }}>📸</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Card Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{ fontSize: '13px' }}
                  />
                  {imagePreview && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedFile(null);
                        setImagePreview(null);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ff3366', cursor: 'pointer', fontSize: '12px', display: 'block', marginTop: '6px', padding: 0 }}
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                  />
                  Active (show in catalog for customers)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    borderRadius: '8px', 
                    background: 'rgba(0,0,0,0.03)', 
                    border: '1px solid var(--glass-border)', 
                    color: 'var(--text-main)', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none' }}
                >
                  {isSaving ? 'Saving...' : 'Save Item'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
