'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Suspense } from 'react';

function ShopFiltersInner({ categories }: { categories: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || '';

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const search = formData.get('q') as string;
    const cat = formData.get('categoryId') as string;
    const cond = formData.get('condition') as string;
    const srt = formData.get('sort') as string;
    const isRookie = formData.get('isRookie');
    const isAuto = formData.get('isAutograph');
    const isNum = formData.get('isNumbered');

    if (search) params.set('q', search);
    if (cat) params.set('categoryId', cat);
    if (cond) params.set('condition', cond);
    if (srt) params.set('sort', srt);
    if (isRookie) params.set('isRookie', 'true');
    if (isAuto) params.set('isAutograph', 'true');
    if (isNum) params.set('isNumbered', 'true');

    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    router.push('/');
  }

  const inputStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' };

  return (
    <form onSubmit={handleSubmit} className="glass-panel filters-container" style={{ marginBottom: '32px' }}>

      <div style={{ flex: '1 1 150px' }}>
        <select name="categoryId" defaultValue={categoryId} style={{ ...inputStyle, width: '100%', WebkitAppearance: 'none', appearance: 'none' }}>
          <option value="" style={{ background: '#1a0b2e', color: 'white' }}>All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id.toString()} style={{ background: '#1a0b2e', color: 'white' }}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 150px' }}>
        <select name="condition" defaultValue={condition} style={{ ...inputStyle, width: '100%', WebkitAppearance: 'none', appearance: 'none' }}>
          <option value="" style={{ background: '#1a0b2e', color: 'white' }}>Any Condition</option>
          <option value="Mint" style={{ background: '#1a0b2e', color: 'white' }}>Mint</option>
          <option value="Near Mint" style={{ background: '#1a0b2e', color: 'white' }}>Near Mint</option>
          <option value="Lightly Played" style={{ background: '#1a0b2e', color: 'white' }}>Lightly Played</option>
          <option value="Moderately Played" style={{ background: '#1a0b2e', color: 'white' }}>Moderately Played</option>
          <option value="Heavily Played" style={{ background: '#1a0b2e', color: 'white' }}>Heavily Played</option>
          <option value="Damaged" style={{ background: '#1a0b2e', color: 'white' }}>Damaged</option>
          <option value="N/A" style={{ background: '#1a0b2e', color: 'white' }}>N/A (Sealed)</option>
        </select>
      </div>

      <div style={{ flex: '1 1 150px' }}>
        <select name="sort" defaultValue={sort} style={{ ...inputStyle, width: '100%', WebkitAppearance: 'none', appearance: 'none' }}>
          <option value="" style={{ background: '#1a0b2e', color: 'white' }}>Newest First</option>
          <option value="price_asc" style={{ background: '#1a0b2e', color: 'white' }}>Price: Low to High</option>
          <option value="price_desc" style={{ background: '#1a0b2e', color: 'white' }}>Price: High to Low</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>Apply</button>
        {(q || categoryId || condition || sort || searchParams.get('isRookie') || searchParams.get('isAutograph') || searchParams.get('isNumbered')) && (
          <button type="button" onClick={handleClear} style={{ padding: '10px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      <div style={{ flexBasis: '100%', display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'white', fontSize: '14px' }}>
          <input type="checkbox" name="isRookie" value="true" defaultChecked={searchParams.get('isRookie') === 'true'} />
          Rookie Cards
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'white', fontSize: '14px' }}>
          <input type="checkbox" name="isAutograph" value="true" defaultChecked={searchParams.get('isAutograph') === 'true'} />
          Autographs
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'white', fontSize: '14px' }}>
          <input type="checkbox" name="isNumbered" value="true" defaultChecked={searchParams.get('isNumbered') === 'true'} />
          Numbered
        </label>
      </div>

    </form>
  );
}

export function ShopFilters({ categories }: { categories: any[] }) {
  return (
    <Suspense fallback={<div className="glass-panel" style={{ height: '90px', marginBottom: '32px' }}>Loading filters...</div>}>
      <ShopFiltersInner categories={categories} />
    </Suspense>
  );
}
