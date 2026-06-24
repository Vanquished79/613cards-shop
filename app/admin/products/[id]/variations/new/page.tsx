import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewVariationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const productId = parseInt(resolvedParams.id);
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    redirect('/admin/products');
  }

  async function createVariation(formData: FormData) {
    'use server'
    const condition = formData.get('condition') as string;
    const isGraded = formData.get('isGraded') === 'on';
    const gradingCompany = formData.get('gradingCompany') as string || null;
    const grade = formData.get('grade') as string || null;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);

    if (isNaN(price) || isNaN(stock)) return;

    await prisma.productVariation.create({
      data: {
        productId,
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

  return (
    <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <Link href={`/admin/products/${productId}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to Product</Link>
        <h1 style={{ margin: 0 }}>Add Variation</h1>
      </div>

      <form action={createVariation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Condition</label>
          <select name="condition" required style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
            <option value="Mint" style={{ background: '#1a0b2e', color: 'white' }}>Mint</option>
            <option value="Near Mint" style={{ background: '#1a0b2e', color: 'white' }}>Near Mint</option>
            <option value="Lightly Played" style={{ background: '#1a0b2e', color: 'white' }}>Lightly Played</option>
            <option value="Moderately Played" style={{ background: '#1a0b2e', color: 'white' }}>Moderately Played</option>
            <option value="Heavily Played" style={{ background: '#1a0b2e', color: 'white' }}>Heavily Played</option>
            <option value="Damaged" style={{ background: '#1a0b2e', color: 'white' }}>Damaged</option>
            <option value="N/A" style={{ background: '#1a0b2e', color: 'white' }}>N/A (Sealed)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input type="checkbox" id="isGraded" name="isGraded" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          <label htmlFor="isGraded" style={{ color: 'white', cursor: 'pointer' }}>Is Graded?</label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Grading Company</label>
            <input name="gradingCompany" placeholder="PSA, BGS, CGC..." style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Grade</label>
            <input name="grade" placeholder="10, 9.5, etc." style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Price ($)</label>
            <input name="price" type="number" step="0.01" required style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>Stock Quantity</label>
            <input name="stock" type="number" required style={inputStyle} defaultValue={1} />
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '16px', fontSize: '16px' }}>
          Create Variation
        </button>
      </form>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', boxSizing: 'border-box' as const };
