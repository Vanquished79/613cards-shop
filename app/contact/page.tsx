'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        setSuccess(true);
        form.reset();
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-main)',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '40px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '32px' }}>Contact <span style={{ color: 'var(--accent-color)' }}>Us</span></h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Have a question about an order or a specific card? Drop us a message below!
        </p>

        {success ? (
          <div style={{ padding: '20px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.2)', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ color: '#4ade80', margin: '0 0 8px 0' }}>Message Sent!</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>We will get back to you as soon as possible.</p>
            <button onClick={() => setSuccess(false)} style={{ background: 'none', border: 'none', color: 'white', marginTop: '16px', cursor: 'pointer', textDecoration: 'underline' }}>
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Your Name</label>
              <input name="name" required style={inputStyle} placeholder="John Doe" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Email Address</label>
              <input name="email" type="email" required style={inputStyle} placeholder="john@example.com" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Message</label>
              <textarea name="message" required rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="How can we help you?" />
            </div>

            {error && <p style={{ color: '#ff6b6b', margin: 0, fontSize: '14px' }}>{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '16px', fontSize: '16px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
