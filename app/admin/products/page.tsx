import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { uploadProductImage } from '@/lib/supabase';
import CreateProductForm from './CreateProductForm';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  const categories = await prisma.category.findMany();

  async function createProduct(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const compareAtPriceRaw = formData.get('compareAtPrice') as string;
    const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : null;
    const stock = parseInt(formData.get('stock') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    const condition = (formData.get('condition') as string) || null;
    
    // Dynamic fields
    const type = (formData.get('type') as string) || 'CARD';
    const cardName = (formData.get('cardName') as string) || null;
    const cardSeries = (formData.get('cardSeries') as string) || null;
    const cardBrand = (formData.get('cardBrand') as string) || null;
    const isRookie = formData.get('isRookie') === 'on';
    const isAutograph = formData.get('isAutograph') === 'on';
    const isNumbered = formData.get('isNumbered') === 'on';
    const isParallel = formData.get('isParallel') === 'on';

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
    
    const isFeatured = formData.get('isFeatured') === 'on';
    
    if (!name || isNaN(price) || isNaN(categoryId)) return;
    
    await prisma.product.create({
      data: { 
        name, description, price, compareAtPrice, stock, categoryId, imageUrl: finalImageUrl, isFeatured, condition,
        type, cardName, cardSeries, cardBrand, isRookie, isAutograph, isNumbered, isParallel 
      }
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
      
      <CreateProductForm categories={categories} createProductAction={createProduct} />

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
                  <h3 style={{ margin: 0 }}>
                    {p.name} {p.isFeatured && <span style={{ fontSize: '12px', background: 'rgba(255, 183, 3, 0.2)', color: '#ffb703', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', verticalAlign: 'middle' }}>Featured</span>}
                  </h3>
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
