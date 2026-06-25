'use client';

import { useState } from 'react';
import { submitWaitlist } from './actions';

export default function ComingSoon() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const result = await submitWaitlist(email);
      
      if (result.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Client submit error:', err);
      setStatus('error');
      setErrorMessage('A network or server error occurred. Please try again.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 30%, #e0f2fe 70%, #f0fdf4 100%)',
      padding: '20px',
      textAlign: 'center',
      fontFamily: "'Fredoka', sans-serif"
    }}>
      <div style={{
        padding: '50px 40px',
        maxWidth: '700px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        background: '#ffffff',
        border: '3px solid #1e293b',
        borderRadius: '24px',
        boxShadow: '8px 8px 0px #1e293b'
      }}>
        {/* Shield Logo */}
        <div style={{ marginBottom: '10px' }}>
          <img
            src="/shield-logo-transparent.png"
            alt="613cards Logo"
            style={{ width: '220px', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        
        <h1 style={{ fontSize: '52px', margin: 0, fontWeight: 800, color: '#0f172a' }}>
          Coming <span style={{ color: '#c2410c' }}>Soon!</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', margin: 0, maxWidth: '500px' }}>
          The premier destination for trading cards and supplies is almost ready. We&apos;re working hard to build the ultimate collection for you!
        </p>

        <div style={{ marginTop: '10px', width: '80%', height: '3px', background: '#1e293b', borderRadius: '2px' }} />
        
        <p style={{ fontSize: '16px', color: '#0f172a', margin: 0, fontWeight: 700 }}>
          Be the first to know when we launch! 🚀
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', maxWidth: '420px', gap: '12px', marginTop: '8px', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={status === 'loading' || status === 'success'}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '3px solid #1e293b',
                background: '#ffffff',
                color: '#0f172a',
                outline: 'none',
                fontSize: '15px',
                fontFamily: "'Fredoka', sans-serif",
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}
            />
            <button 
              type="submit" 
              disabled={status === 'loading' || status === 'success'}
              style={{
                padding: '14px 24px',
                borderRadius: '12px',
                border: '3px solid #1e293b',
                background: '#ffb703',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '4px 4px 0px #1e293b',
                fontFamily: "'Fredoka', sans-serif",
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translate(2px, 2px)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #1e293b';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '4px 4px 0px #1e293b';
              }}
            >
              {status === 'loading' ? 'Saving...' : 'Notify Me'}
            </button>
          </div>
          
          {status === 'success' && (
            <div style={{ color: '#15803d', fontSize: '14px', marginTop: '8px', fontWeight: 600 }}>
              ✅ Thanks! You&apos;ve been added to the waitlist.
            </div>
          )}
          
          {status === 'error' && (
            <div style={{ color: '#b91c1c', fontSize: '14px', marginTop: '8px', fontWeight: 600 }}>
              ❌ {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
