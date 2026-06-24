import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { uploadProductImage } from '@/lib/supabase';
import EditProductForm from './EditProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  const product = await prisma.product.findUnique({ 
    where: { id: productId },
    include: { variations: true }
  });
  const categories = await prisma.category.findMany();

  if (!product) {
    redirect('/admin/products');
  }

  async function updateProduct(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const compareAtPriceRaw = formData.get('compareAtPrice') as string;
    const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : null;
    const categoryId = parseInt(formData.get('categoryId') as string);
    
    // Dynamic fields
    const type = (formData.get('type') as string) || 'CARD';
    const cardName = (formData.get('cardName') as string) || null;
    const cardSeries = (formData.get('cardSeries') as string) || null;
    const isRookie = formData.get('isRookie') === 'on';
    const isAutograph = formData.get('isAutograph') === 'on';
    const isNumbered = formData.get('isNumbered') === 'on';
    const serialNumber = (formData.get('serialNumber') as string) || null;
    const isParallel = formData.get('isParallel') === 'on';

    // Check if the user uploaded a file instead of pasting a URL
    const imageFiles = formData.getAll('imageFile') as File[];
    const fallbackUrl = formData.get('imageUrl') as string;
    let finalImageUrl = fallbackUrl || product?.imageUrl || null;
    
    // Existing additional images from the DB
    let additionalImages = product?.additionalImages ? [...product.additionalImages] : [];
    
    // Remove any deleted images
    const deletedImagesRaw = formData.get('deletedImages') as string;
    if (deletedImagesRaw) {
      try {
        const deletedImages = JSON.parse(deletedImagesRaw);
        additionalImages = additionalImages.filter((img: string) => !deletedImages.includes(img));
      } catch (e) {}
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (file && file.size > 0) {
        const uploadedUrl = await uploadProductImage(file);
        if (uploadedUrl) {
          if (!finalImageUrl) {
            finalImageUrl = uploadedUrl;
          } else {
            additionalImages.push(uploadedUrl);
          }
        }
      }
    }
    
    const isFeatured = formData.get('isFeatured') === 'on';
    
    if (!name || isNaN(categoryId)) return;
    
    await prisma.product.update({
      where: { id: productId },
      data: { 
        name, description, compareAtPrice, categoryId, imageUrl: finalImageUrl, additionalImages, isFeatured,
        type, cardName, cardSeries, isRookie, isAutograph, isNumbered, serialNumber, isParallel
      }
    });
    
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/shop');
    redirect('/admin/products');
  }

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href="/admin/products" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back</Link>
        <h1 style={{ margin: 0 }}>Edit Product</h1>
      </div>
      
      <EditProductForm product={product} categories={categories} updateProductAction={updateProduct} />

      <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '40px 0' }} />

      {/* Variations Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px' }}>Product Variations</h2>
        <Link href={`/admin/products/${productId}/variations/new`} className="btn-primary" style={{ padding: '8px 16px', textDecoration: 'none', fontSize: '14px' }}>
          + Add Variation
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {product.variations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No variations found. Please add at least one variation to make this product purchasable.</p>
        ) : (
          product.variations.map((v: any) => (
            <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                  {v.condition}
                  {v.isGraded && <span style={{ marginLeft: '8px', background: 'rgba(74, 222, 128, 0.2)', color: '#4ade80', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{v.gradingCompany} {v.grade}</span>}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>Stock: {v.stock}</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>${v.price.toFixed(2)}</span>
                <Link href={`/admin/products/${productId}/variations/${v.id}`} style={{ color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '4px', fontSize: '13px' }}>Edit</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
