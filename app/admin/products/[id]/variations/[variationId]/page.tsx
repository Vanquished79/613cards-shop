import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditVariationPage({ params }: { params: Promise<{ id: string, variationId: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  const variationId = parseInt(resolvedParams.variationId);
  
  const variation = await prisma.productVariation.findUnique({ where: { id: variationId } });

  if (!variation || variation.productId !== productId) {
    redirect(`/admin/products/${productId}`);
  }

  async function updateVariation(formData: FormData) {
    'use server'
    const condition = formData.get('condition') as string;
    const isGraded = formData.get('isGraded') === 'on';
    const gradingCompany = formData.get('gradingCompany') as string || null;
    const grade = formData.get('grade') as string || null;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);

    if (isNaN(price) || isNaN(stock)) return;

    await prisma.productVariation.update({
      where: { id: variationId },
      data: {
        condition,
        isGraded,
        gradingCompany,
        grade,
        price,
        stock
      }
    });

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath('/');
    revalidatePath('/shop');
    redirect(`/admin/products/${productId}`);
  }

  async function deleteVariation() {
    'use server'
    await prisma.productVariation.delete({ where: { id: variationId } });
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath('/');
    revalidatePath('/shop');
    redirect(`/admin/products/${productId}`);
  }

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href={`/admin/products/${productId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Product</Link>
        <h1 style={{ margin: 0 }}>Edit Variation</h1>
      </div>

      <form action={updateVariation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Condition</label>
          <select name="condition" defaultValue={variation.condition} required style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
            <option value="Mint" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Mint</option>
            <option value="Near Mint" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Near Mint</option>
            <option value="Lightly Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Lightly Played</option>
            <option value="Moderately Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Moderately Played</option>
            <option value="Heavily Played" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Heavily Played</option>
            <option value="Damaged" style={{ background: '#ffffff', color: 'var(--text-main)' }}>Damaged</option>
            <option value="N/A" style={{ background: '#ffffff', color: 'var(--text-main)' }}>N/A (Sealed)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" id="isGraded" name="isGraded" defaultChecked={variation.isGraded} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          <label htmlFor="isGraded" style={{ color: 'var(--text-main)', cursor: 'pointer' }}>Is Graded?</label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Grading Company</label>
            <input name="gradingCompany" defaultValue={variation.gradingCompany || ''} placeholder="PSA, BGS, CGC..." style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Grade</label>
            <input name="grade" defaultValue={variation.grade || ''} placeholder="10, 9.5, etc." style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Price ($)</label>
            <input name="price" type="number" step="0.01" defaultValue={variation.price} required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Stock Quantity</label>
            <input name="stock" type="number" defaultValue={variation.stock} required style={inputStyle} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '16px', fontSize: '16px' }}>
          Save Changes
        </button>
      </form>

      <form action={deleteVariation} style={{ marginTop: '16px' }}>
        <button type="submit" style={{ width: '100%', padding: '16px', background: 'rgba(220, 38, 38, 0.1)', color: 'var(--text-error)', border: '1px solid var(--text-error)', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
          Delete Variation
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: '#ffffff', color: 'var(--text-main)', boxSizing: 'border-box' as const };
