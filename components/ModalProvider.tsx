'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ConfirmOptions = { title: string; message: string };
type PromptOptions = { title: string; message: string; placeholder?: string };

interface ModalContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'confirm' | 'prompt';
    title: string;
    message: string;
    placeholder?: string;
    resolve: (value: any) => void;
  } | null>(null);

  const [inputValue, setInputValue] = useState('');

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setModalState({ isOpen: true, type: 'confirm', ...options, resolve });
    });
  };

  const prompt = (options: PromptOptions) => {
    setInputValue('');
    return new Promise<string | null>((resolve) => {
      setModalState({ isOpen: true, type: 'prompt', ...options, resolve });
    });
  };

  const handleClose = (value: any) => {
    if (modalState) {
      modalState.resolve(value);
      setModalState(null);
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, prompt }}>
      {children}
      {modalState?.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{
            width: '90%', maxWidth: '400px', padding: '24px', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            transform: 'scale(1)', animation: 'scaleUp 0.2s ease-out'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '20px' }}>{modalState.title}</h2>
            <p style={{ margin: '0 0 20px 0', color: 'var(--text-muted)' }}>{modalState.message}</p>
            
            {modalState.type === 'prompt' && (
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={modalState.placeholder}
                style={{
                  width: '100%', padding: '12px', marginBottom: '24px',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
                  color: 'white', borderRadius: '8px', outline: 'none'
                }}
                autoFocus
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => handleClose(modalState.type === 'confirm' ? false : null)}
                style={{
                  padding: '10px 16px', background: 'transparent', border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleClose(modalState.type === 'confirm' ? true : inputValue)}
                style={{
                  padding: '10px 16px', background: 'var(--accent-color)', border: 'none',
                  color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                {modalState.type === 'confirm' ? 'Confirm' : 'Submit'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
