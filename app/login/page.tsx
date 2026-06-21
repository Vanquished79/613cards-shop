'use client';

import { signIn } from 'next-auth/react';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

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
      router.push('/account'); // Will redirect admins to account, or we can fetch session to redirect admins to admin. For now, /account can handle it or they can click admin.
      router.refresh();
    } else {
      setError('Invalid email/username or password.');
      setLoading(false);
    }
  }

  return (
    <div className="glass-panel" style={{
      width: '100%',
      maxWidth: '420px',
      padding: '48px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '28px',
    }}>
      <Image src="/logo.png" alt="613cards.com" width={260} height={130} style={{ objectFit: 'contain', mixBlendMode: 'lighten' }} />

      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>
          Sign in to your account
        </p>
      </div>

      {registered && (
        <p style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px', width: '100%', textAlign: 'center', margin: 0 }}>
          Account created successfully! Please log in.
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500' }}>Email or Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder="Enter your email"
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

      <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
        Don't have an account? <Link href="/register" style={{ color: 'var(--accent-color)', textDecoration: 'none' }}>Sign up</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
