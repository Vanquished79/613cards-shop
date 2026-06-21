import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { uploadProductImage } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
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
    const condition = (formData.get('condition') as string) || null;
    
    // Check if the user uploaded a file instead of pasting a URL
    const imageFile = formData.get('imageFile') as File;
    const fallbackUrl = formData.get('imageUrl') as string;
    let finalImageUrl = fallbackUrl || product?.imageUrl || null;

    if (imageFile && imageFile.size > 0) {
      const uploadedUrl = await uploadProductImage(imageFile);
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }
    
    const isFeatured = formData.get('isFeatured') === 'on';
    
    if (!name || isNaN(price) || isNaN(categoryId)) return;
    
    await prisma.product.update({
      where: { id: productId },
      data: { name, description, price, stock, categoryId, imageUrl: finalImageUrl, isFeatured }
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
      
      <form action={updateProduct} encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Condition</label>
            <select name="condition" defaultValue={product.condition || ''} style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
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
        </div>



        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Price</label>
            <input name="price" type="number" step="0.01" defaultValue={product.price} required style={inputStyle} />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Stock Quantity</label>
            <input name="stock" type="number" defaultValue={product.stock} required style={inputStyle} />
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Upload New Image (Optional)</label>
            <input name="imageFile" type="file" accept="image/*" style={inputStyle} />
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Or Paste Image URL</label>
          <input name="imageUrl" defaultValue={product.imageUrl || ''} style={inputStyle} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Description</label>
          <textarea name="description" defaultValue={product.description || ''} rows={4} style={{...inputStyle, resize: 'vertical'}} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
          <input type="checkbox" id="isFeatured" name="isFeatured" defaultChecked={product.isFeatured} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          <label htmlFor="isFeatured" style={{ color: 'white', cursor: 'pointer' }}>Feature this product on the Home Page</label>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '16px', fontSize: '16px' }}>
          Save Changes
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
