export const dynamic = 'force-static';

export default function ConditionGuidePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', lineHeight: '1.6' }}>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-accent)' }}>Card Condition Guide</h1>
      
      <div className="glass-panel" style={{ padding: '32px' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          We take the condition of our cards very seriously. While we try our best to grade accurately, please remember that card grading is subjective. 
          Use this guide to understand what to expect when purchasing from our store.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#4ade80' }}>Mint (M)</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              A card in Mint condition appears flawless upon general inspection. It has sharp corners, no edge wear, and a clean surface without scratches or fading. Centering may not be perfect, but the card is otherwise pristine.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#60a5fa' }}>Near Mint (NM)</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Cards in Near Mint condition show minimal to no wear from shuffling, play, or handling and can have a nearly unmarked surface, crisp corners, and unblemished edges outside of a few minor flaws. A NM card may have a tiny edge nick or a slight scratch, but overall looks pack-fresh.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#fbbf24' }}>Lightly Played (LP)</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Cards in Lightly Played condition may have minor border or corner wear, slight scuffing, or mild scratches. There are no major defects such as liquid damage, bends, or severe issues. These cards have clearly been handled but still look great in a binder or sleeve.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#f97316' }}>Moderately Played (MP)</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Moderately Played cards show visible wear. This can include moderate border wear, mild corner rounding, noticeable surface scratches, or minor creasing. These cards are great for playing but may not appeal to strict collectors.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px', color: '#ef4444' }}>Heavily Played (HP) / Damaged</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              Heavily Played cards exhibit severe wear. This can include major creasing, water damage, severe edge wear, heavy scratching, or even small tears. Damaged cards are exactly that—damaged. We rarely sell cards in this condition unless they are highly sought-after vintage items.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
