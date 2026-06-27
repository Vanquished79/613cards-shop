'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{
        width: '100%',
        padding: '10px 8px',
        borderRadius: '8px',
        border: '1px solid var(--text-error)',
        background: '#ffffff',
        color: 'var(--text-error)',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        textAlign: 'left',
      }}
    >
      🔓 Sign Out
    </button>
  );
}
