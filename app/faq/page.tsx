import Link from 'next/link';

export const dynamic = 'force-static';

export default function FAQPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', lineHeight: '1.6' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '32px' }}>Frequently Asked Questions</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-accent)', marginBottom: '12px' }}>How do you ship your cards?</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            All single cards are shipped in a penny sleeve and a top loader or card saver. Orders are packed securely in a bubble mailer or rigid mailer depending on the size of the order to ensure they arrive in the condition they were purchased in.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-accent)', marginBottom: '12px' }}>Do you buy cards?</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Yes! We buy singles, sealed products, and collections. Check out our <Link href="/buy-list" style={{ color: 'var(--text-accent)' }}>Buy-List</Link> page for our current rates and instructions on how to submit your cards.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-accent)', marginBottom: '12px' }}>When will my order ship?</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            We strive to process and ship all orders within 1-2 business days. You will receive a tracking number once your order has been dispatched.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ color: 'var(--text-accent)', marginBottom: '12px' }}>Do you ship internationally?</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Yes, we ship to Canada, the United States, Australia, and most countries in Europe. Shipping costs will be calculated at checkout based on your destination.
          </p>
        </div>
      </div>
    </div>
  );
}
