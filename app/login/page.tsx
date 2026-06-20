'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Invalid username or password.');
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
      }}>
        <Image src="/logo.png" alt="613cards.com" width={180} height={90} style={{ objectFit: 'contain' }} />

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Admin Login</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
            Sign in to manage your shop
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              placeholder="Enter your username"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                fontSize: '15px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-main)',
                fontSize: '15px',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{
              color: '#ff6b6b',
              fontSize: '14px',
              textAlign: 'center',
              background: 'rgba(255,107,107,0.1)',
              padding: '10px',
              borderRadius: '8px',
              margin: 0,
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: loading
                ? 'rgba(138,43,226,0.4)'
                : 'linear-gradient(135deg, var(--accent-color), #6a0dad)',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              width: '100%',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
