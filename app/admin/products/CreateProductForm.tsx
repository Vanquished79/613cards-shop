'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CreateProductForm({ categories, createProductAction }: { categories: any[], createProductAction: (formData: FormData) => Promise<{ error?: string, success?: boolean } | void> }) {
  const [productType, setProductType] = useState('CARD');
  const [fileInputs, setFileInputs] = useState([0]);

  async function handleSubmit(formData: FormData) {
    const result = await createProductAction(formData);
    if (result?.error) {
      toast.error("Failed to add product:\n\n" + result.error);
    } else {
      // Refresh or clear if needed, but Next.js router handles revalidation.
      window.location.href = '/admin/products';
    }
  }

  return (
    <form action={handleSubmit} encType="multipart/form-data" className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
      
      {/* Product Type Selector */}
      <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Product Type</label>
        <div style={{ display: 'flex', gap: '16px' }}>
          {['CARD', 'BOX', 'SUPPLY'].map((type) => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="type" 
                value={type} 
                checked={productType === type} 
                onChange={(e) => setProductType(e.target.value)} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: 'var(--text-main)' }}>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
            </label>
          ))}
        </div>
      </div>

      <input name="name" placeholder="Listing Title (e.g. 2023 Prizm LeBron James)" required style={inputStyle} />
      
      <select name="categoryId" required style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
        <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Select Category</option>
        {categories.map((c: any) => <option key={c.id} value={c.id} style={{ background: '#ffffff', color: 'var(--text-main)' }}>{c.name}</option>)}
      </select>
      
      <select name="condition" style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
        <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Any Condition</option>
        <option value="Mint" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Mint</option>
        <option value="Near Mint" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Near Mint</option>
        <option value="Lightly Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Lightly Played</option>
        <option value="Moderately Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Moderately Played</option>
        <option value="Heavily Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Heavily Played</option>
        <option value="Damaged" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Damaged</option>
        <option value="N/A" style={{ background: '#ffffff', color: 'var(--text-main)' }}>N/A (Sealed)</option>
      </select>

      <input name="price" type="number" step="0.01" placeholder="Price (e.g. 99.99)" required style={inputStyle} />
      <input name="compareAtPrice" type="number" step="0.01" placeholder="Compare At Price (Optional Sale Price)" style={inputStyle} />
      <input name="stock" type="number" placeholder="Stock Quantity" required style={inputStyle} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Upload Image(s) (Hold Ctrl/Cmd to select multiple, or click add more)</label>
        {fileInputs.map((id) => (
          <input key={id} name="imageFile" type="file" accept="image/*" multiple style={inputStyle} />
        ))}
        <button 
          type="button" 
          onClick={() => setFileInputs([...fileInputs, fileInputs.length])}
          style={{ padding: '8px', background: 'var(--glass-bg)', color: 'var(--text-main)', border: '1px dashed var(--glass-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
        >
          + Add another image upload field
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OR Paste Image URL</label>
        <input name="imageUrl" placeholder="https://..." style={inputStyle} />
      </div>

      {/* Dynamic Card Fields */}
      {productType === 'CARD' && (
        <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--glass-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ gridColumn: '1 / -1', margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-accent)' }}>Card Details</h3>
          
          <input name="cardName" placeholder="Card/Player Name (e.g. LeBron James)" style={inputStyle} />
          <input name="cardSeries" placeholder="Series (e.g. 2023 Prizm)" style={inputStyle} />
          <input name="cardBrand" placeholder="Brand (e.g. Panini)" style={inputStyle} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isRookie" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Rookie Card
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isAutograph" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Autograph
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isParallel" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Parallel
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isNumbered" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Numbered
            </label>
            <input name="serialNumber" maxLength={10} placeholder="e.g. 10/99" style={{ width: '120px', padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', marginTop: '4px' }} />
          </div>
        </div>
      )}

      <textarea name="description" placeholder="Description" rows={3} style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }} />
      
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
        <input type="checkbox" id="isFeatured" name="isFeatured" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
        <label htmlFor="isFeatured" style={{ color: 'var(--text-main)', cursor: 'pointer' }}>Feature this product on the Home Page</label>
      </div>

      <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>Add Product</button>
    </form>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)' };
