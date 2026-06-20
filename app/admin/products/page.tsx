import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { uploadProductImage } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  const categories = await prisma.category.findMany();

  async function createProduct(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    
    // Check if the user uploaded a file instead of pasting a URL
    const imageFile = formData.get('imageFile') as File;
    const fallbackUrl = formData.get('imageUrl') as string;
    let finalImageUrl = fallbackUrl || null;

    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }
    
    if (!name || isNaN(price) || isNaN(categoryId)) return;
    
    await prisma.product.create({
      data: { name, description, price, stock, categoryId, imageUrl: finalImageUrl }
    });
    revalidatePath('/admin/products');
  }

  async function deleteProduct(formData: FormData) {
    'use server'
    const id = parseInt(formData.get('id') as string);
    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');
  }

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h1>Manage Products</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add new cards or supplies to your store.</p>
      
      <form action={createProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <input name="name" placeholder="Product Name" required style={inputStyle} />
        <select name="categoryId" required style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
          <option value="" style={{ background: '#1a0b2e', color: 'white' }}>Select Category</option>
          {categories.map((c: any) => <option key={c.id} value={c.id} style={{ background: '#1a0b2e', color: 'white' }}>{c.name}</option>)}
        </select>
        <input name="price" type="number" step="0.01" placeholder="Price (e.g. 99.99)" required style={inputStyle} />
        <input name="stock" type="number" placeholder="Stock Quantity" required style={inputStyle} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Upload Image (from computer)</label>
          <input name="imageFile" type="file" accept="image/*" style={inputStyle} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>OR Paste Image URL</label>
          <input name="imageUrl" placeholder="https://..." style={inputStyle} />
        </div>

        <input name="description" placeholder="Description" style={{ ...inputStyle, gridColumn: '1 / -1' }} />
        <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>Add Product</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products found.</p>
        ) : (
          products.map((p: any) => (
            <div key={p.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <div style={{ width: '50px', height: '50px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}></div>
                )}
                <div>
                  <h3 style={{ margin: 0 }}>{p.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>{p.category.name} • Stock: {p.stock}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>${p.price.toFixed(2)}</span>
                <Link href={`/admin/products/${p.id}`} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '13px' }}>Edit</Link>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" style={{ padding: '6px 12px', background: 'rgba(255,100,100,0.1)', color: '#ff8080', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' };
