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
    const isGraded = formData.get('isGraded');
    const isPreorder = formData.get('isPreorder');
    const isBreak = formData.get('isBreak');

    if (search) params.set('q', search);
    if (cat) params.set('categoryId', cat);
    if (cond) params.set('condition', cond);
    if (srt) params.set('sort', srt);
    if (isRookie) params.set('isRookie', 'true');
    if (isAuto) params.set('isAutograph', 'true');
    if (isNum) params.set('isNumbered', 'true');
    if (isGraded) params.set('isGraded', 'true');
    if (isPreorder) params.set('isPreorder', 'true');
    if (isBreak) params.set('isBreak', 'true');

    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    router.push('/');
  }

  const inputStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', outline: 'none' };

  return (
    <form onSubmit={handleSubmit} className="glass-panel filters-container" style={{ marginBottom: '32px' }}>

      <div style={{ flex: '1 1 150px' }}>
        <select name="categoryId" defaultValue={categoryId} style={{ ...inputStyle, width: '100%', WebkitAppearance: 'none', appearance: 'none' }}>
          <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id.toString()} style={{ background: '#ffffff', color: 'var(--text-main)' }}>{c.name}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 150px' }}>
        <select name="condition" defaultValue={condition} style={{ ...inputStyle, width: '100%', WebkitAppearance: 'none', appearance: 'none' }}>
          <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Any Condition</option>
          <option value="Mint" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Mint</option>
          <option value="Near Mint" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Near Mint</option>
          <option value="Lightly Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Lightly Played</option>
          <option value="Moderately Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Moderately Played</option>
          <option value="Heavily Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Heavily Played</option>
          <option value="Damaged" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Damaged</option>
          <option value="N/A" style={{ background: '#ffffff', color: 'var(--text-main)' }}>N/A (Sealed)</option>
        </select>
      </div>

      <div style={{ flex: '1 1 150px' }}>
        <select name="sort" defaultValue={sort} style={{ ...inputStyle, width: '100%', WebkitAppearance: 'none', appearance: 'none' }}>
          <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Newest First</option>
          <option value="price_asc" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Price: Low to High</option>
          <option value="price_desc" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Price: High to Low</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit" className="btn-primary" style={{ padding: '10px 20px', borderRadius: '8px' }}>Apply</button>
        {(q || categoryId || condition || sort || searchParams.get('isRookie') || searchParams.get('isAutograph') || searchParams.get('isNumbered')) && (
          <button type="button" onClick={handleClear} style={{ padding: '10px 20px', borderRadius: '8px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      <div style={{ flexBasis: '100%', display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px' }}>
          <input type="checkbox" name="isRookie" value="true" defaultChecked={searchParams.get('isRookie') === 'true'} />
          Rookie Cards
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px' }}>
          <input type="checkbox" name="isAutograph" value="true" defaultChecked={searchParams.get('isAutograph') === 'true'} />
          Autographs
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px' }}>
          <input type="checkbox" name="isNumbered" value="true" defaultChecked={searchParams.get('isNumbered') === 'true'} />
          Numbered
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px' }}>
          <input type="checkbox" name="isGraded" value="true" defaultChecked={searchParams.get('isGraded') === 'true'} />
          Graded
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px' }}>
          <input type="checkbox" name="isPreorder" value="true" defaultChecked={searchParams.get('isPreorder') === 'true'} />
          Pre-orders
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-main)', fontSize: '14px' }}>
          <input type="checkbox" name="isBreak" value="true" defaultChecked={searchParams.get('isBreak') === 'true'} />
          Breaks
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
