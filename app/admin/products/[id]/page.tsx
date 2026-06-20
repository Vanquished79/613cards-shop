import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const productId = parseInt(params.id);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  const categories = await prisma.category.findMany();

  if (!product) {
    redirect('/admin/products');
  }

  async function updateProduct(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    const imageUrl = formData.get('imageUrl') as string;
    
    if (!name || isNaN(price) || isNaN(categoryId)) return;
    
    await prisma.product.update({
      where: { id: productId },
      data: { name, description, price, stock, categoryId, imageUrl: imageUrl || null }
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/shop');
    redirect('/admin/products');
  }

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/admin/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back</Link>
        <h1 style={{ margin: 0 }}>Edit Product</h1>
      </div>
      
      <form action={updateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Product Name</label>
          <input name="name" defaultValue={product.name} required style={inputStyle} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Category</label>
            <select name="categoryId" defaultValue={product.categoryId} required style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
              {categories.map((c: any) => <option key={c.id} value={c.id} style={{ background: '#1a0b2e', color: 'white' }}>{c.name}</option>)}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Price</label>
            <input name="price" type="number" step="0.01" defaultValue={product.price} required style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Stock Quantity</label>
            <input name="stock" type="number" defaultValue={product.stock} required style={inputStyle} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Image URL</label>
            <input name="imageUrl" defaultValue={product.imageUrl || ''} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Description</label>
          <textarea name="description" defaultValue={product.description || ''} rows={4} style={{...inputStyle, resize: 'vertical'}} />
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '16px', fontSize: '16px' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
