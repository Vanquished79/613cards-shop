'use client';

import { useState } from 'react';

export function CopyEmailsButton({ emailList }: { emailList: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button 
      onClick={handleCopy}
      className="btn-primary"
      style={{ padding: '8px 16px', fontSize: '14px' }}
    >
      {copied ? 'Copied!' : 'Copy All Emails (BCC)'}
    </button>
  );
}
