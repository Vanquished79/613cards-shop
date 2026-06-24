'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyListClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  
  const [items, setItems] = useState([
    { id: Date.now(), cardName: '', cardSeries: '', condition: 'Near Mint', isGraded: false, gradingCompany: '', grade: '', quantity: 1, expectedPrice: '', imageFile: null as File | null }
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), cardName: '', cardSeries: '', condition: 'Near Mint', isGraded: false, gradingCompany: '', grade: '', quantity: 1, expectedPrice: '', imageFile: null }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('notes', notes);
      
      const cleanItems = items.map(item => ({ ...item, imageFile: undefined }));
      formData.append('items', JSON.stringify(cleanItems));

      items.forEach((item, index) => {
        if (item.imageFile) {
          formData.append(`image_${index}`, item.imageFile);
        }
      });

      const res = await fetch('/api/buy-list', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Submission failed');
      }
      
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || "There was an error submitting your buy-list. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ marginBottom: '16px', color: '#4ade80' }}>Submission Received!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Thank you for submitting your cards. Our team will review your list and contact you with an offer soon.
        </p>
        <button className="btn-primary" onClick={() => router.push('/account')}>
          View My Submissions
        </button>
      </div>
    );
  }

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {items.map((item, index) => (
          <div key={item.id} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Card #{index + 1}</h3>
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(item.id)} style={{ background: 'transparent', border: 'none', color: '#ff3366', cursor: 'pointer', fontSize: '14px' }}>
                  Remove
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Player / Character / Card Name *</label>
                <input required style={inputStyle} value={item.cardName} onChange={e => updateItem(item.id, 'cardName', e.target.value)} placeholder="e.g. Charizard, Tom Brady" />
              </div>
              <div>
                <label style={labelStyle}>Set / Series / Year</label>
                <input style={inputStyle} value={item.cardSeries} onChange={e => updateItem(item.id, 'cardSeries', e.target.value)} placeholder="e.g. Base Set, 2021 Prizm" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Condition *</label>
                <select required style={inputStyle} value={item.condition} onChange={e => updateItem(item.id, 'condition', e.target.value)}>
                  <option value="Mint" style={{ background: '#1a1025' }}>Mint</option>
                  <option value="Near Mint" style={{ background: '#1a1025' }}>Near Mint</option>
                  <option value="Lightly Played" style={{ background: '#1a1025' }}>Lightly Played</option>
                  <option value="Moderately Played" style={{ background: '#1a1025' }}>Moderately Played</option>
                  <option value="Heavily Played" style={{ background: '#1a1025' }}>Heavily Played</option>
                  <option value="Damaged" style={{ background: '#1a1025' }}>Damaged</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="checkbox" checked={item.isGraded} onChange={e => updateItem(item.id, 'isGraded', e.target.checked)} />
                  This card is Graded
                </label>
              </div>
            </div>

            {item.isGraded && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', background: 'rgba(234, 179, 8, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <div>
                  <label style={labelStyle}>Grading Company *</label>
                  <input required={item.isGraded} style={inputStyle} value={item.gradingCompany} onChange={e => updateItem(item.id, 'gradingCompany', e.target.value)} placeholder="e.g. PSA, BGS, CGC" />
                </div>
                <div>
                  <label style={labelStyle}>Grade *</label>
                  <input required={item.isGraded} style={inputStyle} value={item.grade} onChange={e => updateItem(item.id, 'grade', e.target.value)} placeholder="e.g. 10, 9.5" />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Quantity</label>
                <input type="number" min="1" required style={inputStyle} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Expected Price (Optional)</label>
                <input type="number" step="0.01" style={inputStyle} value={item.expectedPrice} onChange={e => updateItem(item.id, 'expectedPrice', e.target.value)} placeholder="What are you looking to get?" />
              </div>
              <div>
                <label style={labelStyle}>Card Image (Optional)</label>
                <input type="file" accept="image/*" style={{...inputStyle, padding: '7px 10px'}} onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    updateItem(item.id, 'imageFile', e.target.files[0]);
                  }
                }} />
              </div>
            </div>

          </div>
        ))}
      </div>

      <div>
        <button type="button" onClick={addItem} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px dashed var(--glass-border)', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}>
          + Add Another Card
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Additional Notes</h3>
        <textarea 
          style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
          value={notes} 
          onChange={e => setNotes(e.target.value)} 
          placeholder="Any extra info you want us to know about this submission?"
        />
      </div>

      <div>
        <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '16px', fontSize: '18px', opacity: isSubmitting ? 0.7 : 1 }}>
          {isSubmitting ? 'Submitting...' : 'Submit Buy-List for Review'}
        </button>
      </div>

    </form>
  );
}
