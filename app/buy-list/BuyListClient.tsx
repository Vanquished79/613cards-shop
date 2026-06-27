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
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Submit Form Items state
  const [items, setItems] = useState([
    { id: Date.now(), cardName: '', cardSeries: '', condition: 'Near Mint', isGraded: false, gradingCompany: '', grade: '', quantity: 1, expectedPrice: '', imageFiles: [] as File[], aiGradingResult: null as any, isGrading: false }
  ]);

  // Wanted Catalog state
  const [wantedSearch, setWantedSearch] = useState('');
  const [attributeFilter, setAttributeFilter] = useState<'all' | 'rc' | 'graded' | 'numbered'>('all');

  const addItem = () => {
    setItems([...items, { id: Date.now(), cardName: '', cardSeries: '', condition: 'Near Mint', isGraded: false, gradingCompany: '', grade: '', quantity: 1, expectedPrice: '', imageFiles: [], aiGradingResult: null, isGrading: false }]);
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
      imageFiles: [] as File[],
      aiGradingResult: null,
      isGrading: false
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
      
      const cleanItems = items.map(item => ({ ...item, imageFiles: undefined }));
      formData.append('items', JSON.stringify(cleanItems));

      items.forEach((item, itemIndex) => {
        if (item.imageFiles && item.imageFiles.length > 0) {
          item.imageFiles.forEach((file, imgIndex) => {
            formData.append(`images_${itemIndex}_${imgIndex}`, file);
          });
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

  const handleAIGrade = async (id: number) => {
    updateItem(id, 'isGrading', true);
    try {
      const item = items.find(i => i.id === id);
      if (!item?.imageFiles || item.imageFiles.length === 0) {
        toast.error("Please upload at least one image to use AI Pre-Grading.");
        updateItem(id, 'isGrading', false);
        return;
      }
      const res = await fetch('/api/ai-grading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: item.imageFiles.map(f => f.name) })
      });
      const data = await res.json();
      if (data.success) {
        updateItem(id, 'aiGradingResult', data.data);
        toast.success('AI Pre-Grading complete!');
      } else {
        toast.error('AI Grading failed.');
      }
    } catch (err) {
      toast.error('AI Grading failed.');
    } finally {
      updateItem(id, 'isGrading', false);
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

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' };

  const pillButtonStyle = (active: boolean) => ({
    background: active ? 'var(--accent-color)' : '#f1f5f9',
    border: active ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
    color: active ? 'white' : 'var(--text-main)',
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
                    <div style={{ width: '84px', height: '118px', flexShrink: 0, background: '#f1f5f9', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          title="Click to expand"
                          onClick={() => setExpandedImage(item.imageUrl)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '28px', color: 'var(--text-muted)' }}>🃏</span>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.name}>
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
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-accent)' }}>
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
                      <option value="Mint" style={{ background: '#ffffff' }}>Mint</option>
                      <option value="Near Mint" style={{ background: '#ffffff' }}>Near Mint</option>
                      <option value="Lightly Played" style={{ background: '#ffffff' }}>Lightly Played</option>
                      <option value="Moderately Played" style={{ background: '#ffffff' }}>Moderately Played</option>
                      <option value="Heavily Played" style={{ background: '#ffffff' }}>Heavily Played</option>
                      <option value="Damaged" style={{ background: '#ffffff' }}>Damaged</option>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Quantity</label>
                    <input type="number" min="1" required style={inputStyle} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label style={labelStyle}>Expected Price (Optional)</label>
                    <input type="number" step="0.01" style={inputStyle} value={item.expectedPrice} onChange={e => updateItem(item.id, 'expectedPrice', e.target.value)} placeholder="What are you looking to get?" />
                  </div>
                </div>

                <div style={{ marginTop: '20px', padding: '16px', background: '#fafafa', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                  <label style={{ ...labelStyle, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📸 Card Photos (Multiple Photos Requested)
                  </label>
                  
                  <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '4px 0 12px 0', lineHeight: '1.4' }}>
                    <strong>Please upload multiple clear photos of your card.</strong> To help us value it accurately, please take close-up photos of **each of the card's 4 corners (front and back)**, as well as full-card front and back views.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Image Previews */}
                    {item.imageFiles && item.imageFiles.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {item.imageFiles.map((file, imgIdx) => {
                          const url = URL.createObjectURL(file);
                          return (
                            <div key={imgIdx} style={{ position: 'relative', width: '80px', height: '110px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                              <img src={url} alt={`Preview ${imgIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button 
                                type="button"
                                onClick={() => {
                                  const updatedFiles = item.imageFiles.filter((_, idx) => idx !== imgIdx);
                                  updateItem(item.id, 'imageFiles', updatedFiles);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '2px',
                                  right: '2px',
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#ff3366',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '18px',
                                  height: '18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                &times;
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* File input and AI Grade Button */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          style={{ ...inputStyle, padding: '8px 12px' }} 
                          onChange={e => {
                            if (e.target.files && e.target.files.length > 0) {
                              const newFiles = Array.from(e.target.files);
                              updateItem(item.id, 'imageFiles', [...(item.imageFiles || []), ...newFiles]);
                            }
                          }}
                        />
                      </div>
                      
                      {item.imageFiles && item.imageFiles.length > 0 && !item.aiGradingResult && (
                        <button 
                          type="button" 
                          onClick={() => handleAIGrade(item.id)}
                          disabled={item.isGrading}
                          style={{ 
                            padding: '8px 16px', 
                            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '8px', 
                            cursor: item.isGrading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: item.isGrading ? 0.7 : 1
                          }}
                        >
                          {item.isGrading ? (
                            <>
                              <span style={{ animation: 'spin 1s linear infinite' }}>↻</span> Scanning...
                            </>
                          ) : (
                            <>✨ Get AI Pre-Grade</>
                          )}
                        </button>
                      )}
                    </div>

                    {/* AI Grading Result Display */}
                    {item.aiGradingResult && (
                      <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '20px' }}>✨</span>
                          <h4 style={{ margin: 0, color: '#e9d5ff', fontSize: '16px' }}>AI Pre-Grading Result</h4>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Est. Grade</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7' }}>{item.aiGradingResult.aiGradeEstimate}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Centering</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.aiGradingResult.aiCentering}</div>
                          </div>
                          <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Sub-Grades</div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '13px', flexWrap: 'wrap' }}>
                              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>Corners: {item.aiGradingResult.metrics.corners}</span>
                              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>Edges: {item.aiGradingResult.metrics.edges}</span>
                              <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>Surface: {item.aiGradingResult.metrics.surface}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '13px', color: '#7c3aed', fontStyle: 'italic', background: '#f8f0ff', padding: '8px', borderRadius: '4px' }}>
                          "{item.aiGradingResult.notes}"
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                          Note: This is an AI estimate and does not guarantee the final offer or official grade.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div>
            <button type="button" onClick={addItem} style={{ padding: '12px 24px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px dashed var(--glass-border)', borderRadius: '8px', cursor: 'pointer', width: '100%', fontSize: '16px', fontWeight: 'bold' }}>
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

      {/* Expanded Image Modal Overlay */}
      {expandedImage && (
        <div 
          onClick={() => setExpandedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1001,
            cursor: 'zoom-out'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={(e) => e.stopPropagation()}>
            <img 
              src={expandedImage} 
              alt="Card Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '85vh', 
                objectFit: 'contain', 
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
              }} 
            />
            <button 
              onClick={() => setExpandedImage(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '28px',
                cursor: 'pointer'
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
