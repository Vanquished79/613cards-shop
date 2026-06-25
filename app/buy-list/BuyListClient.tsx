'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function BuyListClient({ 
  initialWantedItems = [] 
}: { 
  initialWantedItems?: any[] 
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'wanted' | 'submit'>('wanted');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Submit Form Items state
  const [items, setItems] = useState([
    { id: Date.now(), cardName: '', cardSeries: '', condition: 'Near Mint', isGraded: false, gradingCompany: '', grade: '', quantity: 1, expectedPrice: '', imageFile: null as File | null }
  ]);

  // Wanted Catalog state
  const [wantedSearch, setWantedSearch] = useState('');
  const [attributeFilter, setAttributeFilter] = useState<'all' | 'rc' | 'graded' | 'numbered'>('all');

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

  // Logic to handle "Sell This Card" action
  const handleSellWanted = (wantedCard: any) => {
    const newItem = {
      id: Date.now(),
      cardName: wantedCard.name,
      cardSeries: wantedCard.series || '',
      condition: 'Near Mint',
      isGraded: wantedCard.isGraded,
      gradingCompany: wantedCard.gradingCompany || '',
      grade: wantedCard.grade || '',
      quantity: 1,
      expectedPrice: wantedCard.price ? wantedCard.price.toString() : '',
      imageFile: null as File | null
    };

    // If there is only one item and it's completely blank, replace it
    if (items.length === 1 && !items[0].cardName && !items[0].cardSeries) {
      setItems([newItem]);
    } else {
      setItems([...items, newItem]);
    }

    setActiveTab('submit');
    toast.success(`Added ${wantedCard.name} to your Sell List!`);
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
      toast.error(err.message || "There was an error submitting your buy-list. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter wanted items based on search and attribute filter
  const filteredWantedItems = useMemo(() => {
    return initialWantedItems.filter(item => {
      // 1. Search Query
      const matchesSearch = 
        item.name.toLowerCase().includes(wantedSearch.toLowerCase()) || 
        (item.series && item.series.toLowerCase().includes(wantedSearch.toLowerCase())) ||
        (item.parallel && item.parallel.toLowerCase().includes(wantedSearch.toLowerCase()));
      
      if (!matchesSearch) return false;

      // 2. Attribute filter
      if (attributeFilter === 'rc') return item.isRC;
      if (attributeFilter === 'graded') return item.isGraded;
      if (attributeFilter === 'numbered') return item.isNumbered;

      return true;
    });
  }, [initialWantedItems, wantedSearch, attributeFilter]);

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

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' };

  const pillButtonStyle = (active: boolean) => ({
    background: active ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.2s',
    fontWeight: active ? 'bold' : 'normal'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
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
            fontSize: '17px',
            transition: 'all 0.2s'
          }}
        >
          Cards We're Buying
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'submit' ? 'var(--accent-color)' : 'var(--text-muted)',
            fontWeight: activeTab === 'submit' ? 'bold' : 'normal',
            borderBottom: activeTab === 'submit' ? '2px solid var(--accent-color)' : '2px solid transparent',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '17px',
            transition: 'all 0.2s'
          }}
        >
          Submit a Sell List
        </button>
      </div>

      {/* Wanted Catalog Tab */}
      {activeTab === 'wanted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Search and Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="text" 
              value={wantedSearch} 
              onChange={(e) => setWantedSearch(e.target.value)}
              placeholder="Search by player, card name, set, or parallel..."
              style={inputStyle}
            />
            
            {/* Attribute Filter Pills */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setAttributeFilter('all')} 
                style={pillButtonStyle(attributeFilter === 'all')}
              >
                All Cards
              </button>
              <button 
                onClick={() => setAttributeFilter('rc')} 
                style={pillButtonStyle(attributeFilter === 'rc')}
              >
                Rookie Cards (RC)
              </button>
              <button 
                onClick={() => setAttributeFilter('graded')} 
                style={pillButtonStyle(attributeFilter === 'graded')}
              >
                Graded Cards
              </button>
              <button 
                onClick={() => setAttributeFilter('numbered')} 
                style={pillButtonStyle(attributeFilter === 'numbered')}
              >
                Serial Numbered
              </button>
            </div>
          </div>

          {/* Grid display */}
          {filteredWantedItems.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No cards found matching your filters. Try checking spelling or changing filters!
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              {filteredWantedItems.map(item => (
                <div 
                  key={item.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    
                    {/* Card Image */}
                    <div style={{ width: '84px', height: '118px', flexShrink: 0, background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '28px', color: 'var(--text-muted)' }}>🃏</span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
                        {item.name}
                      </h4>
                      {item.series && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.series}
                        </span>
                      )}

                      {/* Price tag */}
                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>We Pay:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                          {item.price ? `$${item.price.toFixed(2)}` : 'Contact for Offer'}
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

                  {/* CTA Sell Card */}
                  <button 
                    onClick={() => handleSellWanted(item)}
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      borderRadius: '8px', 
                      fontSize: '13px', 
                      fontWeight: 'bold',
                      border: 'none',
                      marginTop: '4px'
                    }}
                  >
                    Sell This Card
                  </button>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Sell Submission Form Tab */}
      {activeTab === 'submit' && (
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
      )}

    </div>
  );
}
