'use client';

import { useState } from 'react';

export default function EditProductForm({ product, categories, updateProductAction }: { product: any, categories: any[], updateProductAction: (formData: FormData) => void }) {
  const [productType, setProductType] = useState(product.type || 'CARD');
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [fileInputs, setFileInputs] = useState([0]);

  return (
    <form action={updateProductAction} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Product Type Selector */}
      <div style={{ marginBottom: '8px' }}>
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

      <div>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Listing Title</label>
        <input name="name" defaultValue={product.name} required style={inputStyle} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Category</label>
          <select name="categoryId" defaultValue={product.categoryId} required style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
            {categories.map((c: any) => <option key={c.id} value={c.id} style={{ background: '#ffffff', color: 'var(--text-main)' }}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Compare At Price</label>
          <input name="compareAtPrice" type="number" step="0.01" defaultValue={product.compareAtPrice || ''} placeholder="Optional Sale Price" style={inputStyle} />
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Upload Additional Image(s)</label>
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
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Main Image URL (Override)</label>
          <input name="imageUrl" defaultValue={product.imageUrl || ''} placeholder="https://..." style={inputStyle} />
        </div>
      </div>
      
      {/* Existing Images Gallery Management */}
      <div style={{ padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
        <label style={{ display: 'block', marginBottom: '16px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 'bold' }}>Manage Images</label>
        
        {/* Hidden input to pass deleted images array to the server */}
        <input type="hidden" name="deletedImages" value={JSON.stringify(deletedImages)} />
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Main Image */}
          {product.imageUrl && (
            <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '2px solid var(--accent-color)', overflow: 'hidden', background: 'black' }}>
              <img src={product.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Main" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--accent-color)', color: 'black', fontSize: '10px', textAlign: 'center', fontWeight: 'bold', padding: '2px' }}>MAIN</div>
            </div>
          )}
          
          {/* Gallery Images */}
          {product.additionalImages?.map((imgUrl: string) => {
            const isDeleted = deletedImages.includes(imgUrl);
            if (isDeleted) return null;
            return (
              <div key={imgUrl} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', border: '1px solid var(--glass-border)', overflow: 'hidden', background: 'black', opacity: isDeleted ? 0.3 : 1 }}>
                <img src={imgUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Gallery" />
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); setDeletedImages([...deletedImages, imgUrl]); }}
                  style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'red', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', padding: 0 }}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Card Fields */}
      {productType === 'CARD' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--glass-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ gridColumn: '1 / -1', margin: '0 0 8px 0', fontSize: '16px', color: 'var(--accent-color)' }}>Card Details</h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Card/Player Name</label>
            <input name="cardName" defaultValue={product.cardName || ''} style={inputStyle} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Series (e.g. 2023 Prizm)</label>
            <input name="cardSeries" defaultValue={product.cardSeries || ''} style={inputStyle} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isRookie" defaultChecked={product.isRookie} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Rookie Card
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isAutograph" defaultChecked={product.isAutograph} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Autograph
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isNumbered" defaultChecked={product.isNumbered} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Numbered
            </label>
            <input name="serialNumber" defaultValue={product.serialNumber || ''} placeholder="Serial Number (e.g. 245/499)" style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', marginTop: '4px' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
              <input type="checkbox" name="isParallel" defaultChecked={product.isParallel} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              Parallel
            </label>
          </div>
        </div>
      )}

      <div>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Description</label>
        <textarea name="description" defaultValue={product.description || ''} rows={4} style={{...inputStyle, resize: 'vertical'}} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
        <input type="checkbox" id="isFeatured" name="isFeatured" defaultChecked={product.isFeatured} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
        <label htmlFor="isFeatured" style={{ color: 'var(--text-main)', cursor: 'pointer' }}>Feature this product on the Home Page</label>
      </div>

      <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '16px', fontSize: '16px' }}>
        Save Changes
      </button>
    </form>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', boxSizing: 'border-box' as const };
