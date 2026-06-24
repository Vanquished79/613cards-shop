'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success?: number, errors?: string[] } | null>(null);
  const router = useRouter();

  const handleDownloadSample = () => {
    const headers = ['name', 'description', 'price', 'stock', 'category', 'isRookie', 'isAutograph', 'isNumbered', 'cardNumber', 'cardSeries', 'image'];
    const sampleRow = ['"Connor McDavid Young Guns"', '"Gem Mint Condition"', '1500.00', '1', 'Hockey Cards', 'true', 'false', 'false', '"#201"', '"Upper Deck Series 1"', '""'];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '613cards_bulk_import_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvData: text }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({ success: data.count, errors: data.errors });
        setFile(null);
      } else {
        setResult({ errors: [data.error || 'Failed to import'] });
      }

    } catch (err: any) {
      setResult({ errors: [err.message] });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '28px' }} className="glass-panel">
      <h1 style={{ marginBottom: '24px' }}>Bulk Import Products</h1>
      
      <div style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Instructions</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.6' }}>
          Upload a CSV file to create multiple products at once. The first row must be the header row matching exactly. 
          If a category does not exist, it will be created automatically. Booleans (isRookie, isAutograph) should be "true" or "false".
        </p>
        <button 
          onClick={handleDownloadSample}
          style={{ padding: '8px 16px', background: 'var(--accent-color)', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Download Sample CSV
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select CSV File</label>
          <input 
            type="file" 
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              border: '1px dashed var(--glass-border)', 
              borderRadius: '8px', 
              background: 'rgba(0,0,0,0.2)', 
              color: 'white' 
            }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={!file || isUploading}
          style={{ 
            padding: '12px', 
            background: file && !isUploading ? '#4ade80' : 'rgba(255,255,255,0.1)', 
            color: file && !isUploading ? '#000' : 'var(--text-muted)', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: file && !isUploading ? 'pointer' : 'not-allowed', 
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {isUploading ? 'Importing...' : 'Upload & Import'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Import Results</h2>
          
          {result.success !== undefined && (
            <div style={{ color: '#4ade80', marginBottom: '16px', fontWeight: 'bold' }}>
              Successfully imported {result.success} products!
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div>
              <h3 style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>Errors / Warnings:</h3>
              <ul style={{ color: '#ef4444', fontSize: '14px', margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
