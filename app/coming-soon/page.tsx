'use client';

import Image from 'next/image';
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
      background: 'radial-gradient(circle at 50% 0%, #302048, var(--bg-color-end) 80%)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div className="glass-panel" style={{
        padding: '40px',
        maxWidth: '700px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Much larger logo per user request, with negative margins to remove built-in image padding */}
        <div style={{ background: 'transparent', marginTop: '-30px', marginBottom: '-40px', display: 'flex', justifyContent: 'center' }}>
          <Image 
            src="/logo-transparent.png" 
            alt="613cards.online Logo" 
            width={400} 
            height={400} 
            style={{ objectFit: 'contain', backgroundColor: 'transparent', maxWidth: '100%', height: 'auto' }} 
            unoptimized
            priority 
          />
        </div>
        
        <h1 style={{ fontSize: '42px', margin: 0, fontWeight: 800 }}>
          <span style={{ color: 'var(--text-main)' }}>Coming</span> <span style={{ color: 'var(--accent-color)' }}>Soon</span>
        </h1>
        
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
          The premier destination for trading cards and supplies is almost ready. We are working hard to build the ultimate collection for you.
        </p>

        <div style={{ marginTop: '32px', width: '100%', height: '1px', background: 'var(--glass-border)' }} />
        
        <p style={{ fontSize: '16px', color: 'white', margin: 0, fontWeight: 'bold' }}>
          Be the first to know when we launch!
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', maxWidth: '400px', gap: '12px', marginTop: '12px', flexDirection: 'column' }}>
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
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={status === 'loading' || status === 'success'}
              style={{ padding: '12px 24px', borderRadius: '8px' }}
            >
              {status === 'loading' ? 'Saving...' : 'Notify Me'}
            </button>
          </div>
          
          {status === 'success' && (
            <div style={{ color: '#4ade80', fontSize: '14px', marginTop: '8px' }}>
              Thanks! You've been added to the waitlist.
            </div>
          )}
          
          {status === 'error' && (
            <div style={{ color: '#ff8080', fontSize: '14px', marginTop: '8px' }}>
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
