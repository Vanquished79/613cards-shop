'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CANADIAN_PROVINCES, EUROPEAN_COUNTRIES } from '@/lib/taxes';

export function ProfileForm({ user }: { user: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [country, setCountry] = useState(user.country || '');
  const [state, setState] = useState(user.state || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={labelStyle}>Full Name</label>
        <input name="name" defaultValue={user.name} required style={inputStyle} />
      </div>
      
      <div>
        <label style={labelStyle}>Email</label>
        <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
      </div>

      <div>
        <label style={labelStyle}>Street Address</label>
        <input name="address" defaultValue={user.address || ''} style={inputStyle} placeholder="123 Main St" />
      </div>

      <div>
        <label style={labelStyle}>Country</label>
        <select 
          name="country"
          value={country} 
          onChange={(e) => {
            setCountry(e.target.value);
            setState(''); // Reset state/province when country changes
          }}
          style={inputStyle}
        >
          <option value="" style={{ background: '#1a1025', color: 'white' }}>Select Country</option>
          <option value="CA" style={{ background: '#1a1025', color: 'white' }}>Canada</option>
          <option value="US" style={{ background: '#1a1025', color: 'white' }}>United States</option>
          <option value="AU" style={{ background: '#1a1025', color: 'white' }}>Australia</option>
          <optgroup label="Europe" style={{ background: '#1a1025', color: 'var(--text-muted)' }}>
            {EUROPEAN_COUNTRIES.map(c => (
              <option key={c.code} value={c.code} style={{ background: '#1a1025', color: 'white' }}>{c.name}</option>
            ))}
          </optgroup>
          <option value="OTHER" style={{ background: '#1a1025', color: 'white' }}>Other</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>City</label>
          <input name="city" defaultValue={user.city || ''} style={inputStyle} placeholder="City" />
        </div>
        <div>
          <label style={labelStyle}>{country === 'CA' ? 'Province' : 'State'}</label>
          {country === 'CA' ? (
            <select 
              name="state"
              value={state} 
              onChange={(e) => setState(e.target.value)}
              style={inputStyle}
            >
              <option value="" style={{ background: '#1a1025', color: 'white' }}>Select Province</option>
              {CANADIAN_PROVINCES.map(p => (
                <option key={p.code} value={p.code} style={{ background: '#1a1025', color: 'white' }}>{p.name}</option>
              ))}
            </select>
          ) : (
            <input 
              name="state" 
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={inputStyle} 
              placeholder={country === 'US' ? 'NY' : 'State/Region'} 
            />
          )}
        </div>
        <div>
          <label style={labelStyle}>ZIP / Postal</label>
          <input name="zip" defaultValue={user.zip || ''} style={inputStyle} placeholder="10001" />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '16px' }}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
const labelStyle = { display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' };
