'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/ModalProvider';
import { toast } from 'react-hot-toast';

export default function PortfolioClient({ initialItems, buyListEnabled = true }: { initialItems: any[], buyListEnabled?: boolean }) {
  const router = useRouter();
  const { confirm, prompt } = useModal();
  const [items, setItems] = useState(initialItems);
  const [isAdding, setIsAdding] = useState(false);
  const [isSelling, setIsSelling] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ cardName: '', cardSeries: '', condition: 'NM', purchasePrice: 0, currentValue: 0, imageUrl: '', isAutographed: false, isNumbered: false, serialNumber: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImageFile(file);
    
    if (!file) return;

    setIsAnalyzing(true);
    try {
      // 1. Send to AI Vision API
      const formData = new FormData();
      formData.append('image', file);
      
      const aiRes = await fetch('/api/ai-vision', {
        method: 'POST',
        body: formData
      });
      
      if (!aiRes.ok) {
        const errData = await aiRes.json().catch(()=>({}));
        throw new Error(errData.error || 'AI Vision failed');
      }
      
      const aiData = await aiRes.json();
      const extractedName = aiData.data.cardName;
      const extractedSeries = aiData.data.cardSeries;
      
      // Update UI with extracted data instantly
      setNewItem(prev => ({
        ...prev,
        cardName: extractedName,
        cardSeries: extractedSeries,
        isAutographed: aiData.data.isAutographed || false,
        isNumbered: aiData.data.isNumbered || false,
        serialNumber: aiData.data.serialNumber || ''
      }));
      
      toast.success(`AI Extracted: ${extractedName}`);

      // 2. Fetch Comps
      const compsRes = await fetch(`/api/comps?q=${encodeURIComponent(extractedName)}`);
      if (compsRes.ok) {
        const compsData = await compsRes.json();
        if (compsData.averagePrice) {
          setNewItem(prev => ({
            ...prev,
            currentValue: compsData.averagePrice
          }));
          toast.success(`Market Comp found: $${compsData.averagePrice.toFixed(2)}`);
        }
      } else {
        const errData = await compsRes.json().catch(()=>({}));
        toast.error(`Comps Error: ${errData.error || 'Failed to fetch market data'}`);
      }
      
    } catch (err: any) {
      console.error(err);
      toast.error(`Error: ${err.message || 'Could not auto-analyze image'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.cardName) return toast.error('Card Name is required');
    setIsSubmitting(true);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append('cardName', newItem.cardName);
        formData.append('cardSeries', newItem.cardSeries);
        formData.append('condition', newItem.condition);
        formData.append('purchasePrice', newItem.purchasePrice.toString());
        formData.append('currentValue', newItem.currentValue.toString());
        formData.append('isAutographed', newItem.isAutographed.toString());
        formData.append('isNumbered', newItem.isNumbered.toString());
        if (newItem.serialNumber) formData.append('serialNumber', newItem.serialNumber);
        formData.append('imageFile', imageFile);
        
        res = await fetch('/api/user/portfolio', {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch('/api/user/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      }
      
      if (res.ok) {
        const data = await res.json();
        setItems([data, ...items]);
        setIsAdding(false);
        setNewItem({ cardName: '', cardSeries: '', condition: 'NM', purchasePrice: 0, currentValue: 0, imageUrl: '', isAutographed: false, isNumbered: false, serialNumber: '' });
        setImageFile(null);
        toast.success('Card added to portfolio');
      }
    } catch (err) {
      toast.error('Error adding card');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals
  const totalValue = items.reduce((sum, item) => sum + (item.currentValue || 0), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
  const netProfit = totalValue - totalCost;
  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100).toFixed(1) : '0.0';

  const handleDelete = async (id: number) => {
    const isConfirmed = await confirm({
      title: 'Remove Item',
      message: 'Are you sure you want to remove this item from your portfolio?'
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/user/portfolio?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems(items.filter(i => i.id !== id));
      toast.success('Item removed');
    } catch (err) {
      toast.error('Error removing item');
    }
  };

  const handleSellToStore = async (item: any) => {
    setIsSelling(item.id);
    try {
      // Direct push to Buy-List
      const res = await fetch('/api/user/buy-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `Selling directly from Portfolio: ${item.cardName}`,
          items: [{
            cardName: item.cardName,
            cardSeries: item.cardSeries || '',
            condition: item.isGraded ? 'GRADED' : 'NM',
            isGraded: item.isGraded,
            gradingCompany: item.gradingCompany || '',
            grade: item.grade || '',
            quantity: 1,
            expectedPrice: item.currentValue || 0,
            imageUrl: item.imageUrl || ''
          }]
        })
      });

      if (!res.ok) throw new Error('Failed to submit');
      toast.success('Submitted to Buy-List! We will review it shortly.');
      router.push('/account'); // Navigate back to account to see the buylist tab
    } catch (err) {
      toast.error('Error submitting to Buy-List');
      setIsSelling(null);
    }
  };

  return (
    <div>
      {/* Portfolio Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(30,30,40,0.4) 0%, rgba(20,20,30,0.6) 100%)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-accent)' }}>${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>${totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Return</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
            {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span style={{ fontSize: '16px', opacity: 0.8 }}>({roi}%)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>Collection Items ({items.length})</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary" 
          style={{ padding: '8px 16px', borderRadius: '8px' }}
        >
          + Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Your portfolio is empty. Add cards to track their value, or purchase cards with the "Vault" shipping option!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {items.map(item => (
            <div key={item.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              
              {item.isVaulted && (
                <span style={{ position: 'absolute', top: '16px', right: '16px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  VAULTED
                </span>
              )}

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '80px', height: '112px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.cardName} 
                      title="Click to expand"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} 
                      onClick={() => setExpandedImage(item.imageUrl)}
                    />
                  ) : (
                    <span style={{ fontSize: '24px' }}>🃏</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.cardName}</h3>
                  {item.cardSeries && <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.cardSeries}</div>}
                  
                  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {item.isGraded && (
                      <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '4px', border: '1px solid #22c55e' }}>
                        {item.gradingCompany} {item.grade}
                      </span>
                    )}
                    {item.isAutographed && (
                      <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                        ✍️ Auto
                      </span>
                    )}
                    {item.isNumbered && item.serialNumber && (
                      <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', borderRadius: '4px', border: '1px solid #a855f7' }}>
                        # {item.serialNumber}
                      </span>
                    )}
                  </div>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cost</div>
                      <div style={{ fontSize: '14px' }}>${item.purchasePrice ? item.purchasePrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Est. Value</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-accent)' }}>${item.currentValue ? item.currentValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                {buyListEnabled && (
                  <button 
                    onClick={() => handleSellToStore(item)}
                    disabled={isSelling === item.id}
                    style={{ flex: 1, padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    {isSelling === item.id ? 'Submitting...' : 'Sell to Store'}
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ padding: '8px 12px', flex: buyListEnabled ? 'none' : 1, background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
                  title="Remove from Portfolio"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
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

      {/* Add Item Modal */}
      {isAdding && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '32px', width: '100%', maxWidth: '500px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '24px' }}>Add Portfolio Item</h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Card Name *</label>
                <input required type="text" value={newItem.cardName} onChange={(e) => setNewItem({...newItem, cardName: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }} placeholder="e.g., Charizard Holographic" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Image Upload (Optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    disabled={isAnalyzing}
                    onChange={handleImageSelect} 
                    style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', opacity: isAnalyzing ? 0.5 : 1 }} 
                  />
                  {isAnalyzing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-accent)', fontSize: '13px', fontWeight: 'bold' }}>
                      <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid var(--accent-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                      Analyzing AI Vision & Market Comps...
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Purchase Price</label>
                  <input type="number" step="0.01" value={newItem.purchasePrice} onChange={(e) => setNewItem({...newItem, purchasePrice: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Est. Value</label>
                  <input type="number" step="0.01" value={newItem.currentValue} onChange={(e) => setNewItem({...newItem, currentValue: parseFloat(e.target.value) || 0})} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <input type="checkbox" checked={newItem.isAutographed} onChange={(e) => setNewItem({...newItem, isAutographed: e.target.checked})} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  Autographed
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <input type="checkbox" checked={newItem.isNumbered} onChange={(e) => setNewItem({...newItem, isNumbered: e.target.checked})} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    Numbered
                  </label>
                  {newItem.isNumbered && (
                    <input type="text" value={newItem.serialNumber} onChange={(e) => setNewItem({...newItem, serialNumber: e.target.value})} placeholder="e.g. 10/99" style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '6px' }} />
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setIsAdding(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Add Card</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
