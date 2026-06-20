import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany();

  async function createCategory(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    if (!name) return;
    
    await prisma.category.create({
      data: { name, description }
    });
    revalidatePath('/admin/categories');
  }

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      <h1>Manage Categories</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Create custom card and supply categories.</p>
      
      <form action={createCategory} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <input 
          type="text" 
          name="name" 
          placeholder="Category Name" 
          required 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
        />
        <input 
          type="text" 
          name="description" 
          placeholder="Description (Optional)" 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', flex: 1 }}
        />
        <button type="submit" className="btn-primary">Add Category</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No categories found.</p>
        ) : (
          categories.map(cat => (
            <div key={cat.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ margin: 0 }}>{cat.name}</h3>
              {cat.description && <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>{cat.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
