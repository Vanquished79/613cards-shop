'use client';

import { useState } from 'react';
import { removeSubscriber } from './actions';
import { Trash2 } from 'lucide-react';
import { useModal } from '@/components/ModalProvider';

export function DeleteButton({ id, email }: { id: number, email: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm } = useModal();

  async function handleDelete() {
    const isConfirmed = await confirm({ title: 'Remove Subscriber', message: `Are you sure you want to remove ${email} from the waitlist?` });
    if (!isConfirmed) return;
    
    setIsDeleting(true);
    await removeSubscriber(id, email);
    // Page will automatically revalidate and refresh
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--text-error)',
        cursor: isDeleting ? 'not-allowed' : 'pointer',
        opacity: isDeleting ? 0.5 : 1,
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        transition: 'background 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
      title="Remove Subscriber"
    >
      <Trash2 size={18} />
    </button>
  );
}
