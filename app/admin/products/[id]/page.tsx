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
        additionalImages = additionalImages.filter(img => !deletedImages.includes(img));
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
    
    if (!name || isNaN(price) || isNaN(categoryId)) return;
    
    await prisma.product.update({
      where: { id: productId },
      data: { 
        name, description, price, compareAtPrice, stock, categoryId, imageUrl: finalImageUrl, additionalImages, isFeatured, condition,
        type, cardName, cardSeries, cardBrand, isRookie, isAutograph, isNumbered, serialNumber, isParallel
      }
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
      
      <EditProductForm product={product} categories={categories} updateProductAction={updateProduct} />
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
