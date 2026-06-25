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
      {expandedImage && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={() => setExpandedImage(null)}
        >
          <img src={expandedImage} alt="Expanded" style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: '12px' }} />
        </div>
      )}
      {/* Portfolio Stats Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', background: 'linear-gradient(145deg, rgba(30,30,40,0.4) 0%, rgba(20,20,30,0.6) 100%)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Value</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent-color)' }}>${totalValue.toFixed(2)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>${totalCost.toFixed(2)}</div>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Return</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
            {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toFixed(2)} <span style={{ fontSize: '16px', opacity: 0.8 }}>({roi}%)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', margin: 0 }}>Collection Items ({items.length})</h2>
        <button 
          onClick={async () => {
            const name = await prompt({
              title: "Add Portfolio Item",
              message: "Enter the name of the card you want to add manually:",
              placeholder: "e.g., 1999 Base Set Charizard Holographic"
            });
            if (name) {
              fetch('/api/user/portfolio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardName: name, purchasePrice: 0, currentValue: 0 })
              }).then(r => r.json()).then(data => setItems([data, ...items]));
            }
          }}
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
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
                  </div>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cost</div>
                      <div style={{ fontSize: '14px' }}>${item.purchasePrice?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Est. Value</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-color)' }}>${item.currentValue?.toFixed(2) || '0.00'}</div>
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
    </div>
  );
}
