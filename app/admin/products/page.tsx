import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ include: { category: true } });
  const categories = await prisma.category.findMany();

  async function createProduct(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const categoryId = parseInt(formData.get('categoryId') as string);
    
    if (!name || isNaN(price) || isNaN(categoryId)) return;
    
    await prisma.product.create({
      data: { name, description, price, stock, categoryId }
    });
    revalidatePath('/admin/products');
  }

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h1>Manage Products</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add new cards or supplies to your store.</p>
      
      <form action={createProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <input name="name" placeholder="Product Name" required style={inputStyle} />
        <select name="categoryId" required style={{...inputStyle, WebkitAppearance: 'none', appearance: 'none'}}>
          <option value="" style={{ color: 'black' }}>Select Category</option>
          {categories.map((c: any) => <option key={c.id} value={c.id} style={{ color: 'black' }}>{c.name}</option>)}
        </select>
        <input name="price" type="number" step="0.01" placeholder="Price (e.g. 99.99)" required style={inputStyle} />
        <input name="stock" type="number" placeholder="Stock Quantity" required style={inputStyle} />
        <input name="description" placeholder="Description" style={{ ...inputStyle, gridColumn: '1 / -1' }} />
        <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>Add Product</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {products.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No products found.</p>
        ) : (
          products.map((p: any) => (
            <div key={p.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>{p.category.name} • Stock: {p.stock}</p>
              </div>
              <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>${p.price.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' };
