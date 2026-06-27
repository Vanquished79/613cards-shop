export const dynamic = 'force-static';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', lineHeight: '1.6' }}>
      <h1 style={{ marginBottom: '32px', color: 'var(--text-accent)' }}>Terms of Service & Privacy Policy</h1>
      
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          By accessing and purchasing from 613cards, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>2. Pricing and Availability</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          All prices are listed in CAD. Due to the fast-moving nature of trading card inventory, occasionally an item may be out of stock even if listed as available. If an item you purchased is out of stock, we will refund you for that item immediately. Prices are subject to change without notice based on market conditions.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>3. Privacy Policy</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          We collect necessary information (name, email, shipping address) solely for the purpose of fulfilling your order and communicating with you regarding your purchase. We do not sell your personal data to third parties. Payment information is securely processed through our payment partners (e.g., PayPal, Stripe) and is never stored on our servers.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>4. Taxes and Duties</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Canadian customers will be charged applicable provincial taxes at checkout. International customers (including the USA and Europe) are responsible for any customs duties, import taxes, or VAT incurred upon delivery. We will not falsely declare values on customs forms.
        </p>

        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>5. User Accounts</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          You are responsible for maintaining the confidentiality of your account credentials. We reserve the right to suspend or terminate accounts that engage in fraudulent activity, chargeback abuse, or violations of our terms.
        </p>
      </div>
    </div>
  );
}
