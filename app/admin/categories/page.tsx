import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Recursively build a flat list with depth info for indented display
function flattenCategories(categories: any[], parentId: number | null = null, depth = 0): any[] {
  return categories
    .filter((c: any) => c.parentId === parentId)
    .flatMap((c: any) => [{ ...c, depth }, ...flattenCategories(categories, c.id, depth + 1)]);
}

// Build a display label showing hierarchy e.g. "Pokémon > Scarlet & Violet"
function buildLabel(cat: any, allCats: any[]): string {
  if (!cat.parentId) return cat.name;
  const parent = allCats.find((c: any) => c.id === cat.parentId);
  return parent ? `${buildLabel(parent, allCats)} > ${cat.name}` : cat.name;
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  const flat = flattenCategories(categories);

  async function createCategory(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const parentIdRaw = formData.get('parentId') as string;
    const parentId = parentIdRaw ? parseInt(parentIdRaw) : null;
    if (!name) return;
    await prisma.category.create({ data: { name, description, parentId } });
    revalidatePath('/admin/categories');
  }

  async function deleteCategory(formData: FormData) {
    'use server';
    const id = parseInt(formData.get('id') as string);
    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
  }

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'rgba(255,255,255,0.05)',
    color: 'var(--text-main)',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Create form */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h1 style={{ marginBottom: '20px' }}>Categories</h1>
        <form action={createCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input name="name" placeholder="Category Name" required style={inputStyle} />
          <input name="description" placeholder="Description (optional)" style={inputStyle} />

          <select name="parentId" style={{ ...inputStyle, appearance: 'none' as const }}>
            <option value="" style={{ background: '#ffffff', color: 'var(--text-main)' }}>— Top-level category (no parent) —</option>
            {flat.map((cat: any) => (
              <option key={cat.id} value={cat.id} style={{ background: '#ffffff', color: 'var(--text-main)' }}>
                {'　'.repeat(cat.depth)}{cat.depth > 0 ? '↳ ' : ''}{cat.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
            + Add Category
          </button>
        </form>
      </div>

      {/* Category tree */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>All Categories</h2>
        {flat.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No categories yet. Create one above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {flat.map((cat: any) => (
              <div
                key={cat.id}
                style={{
                  marginLeft: `${cat.depth * 28}px`,
                  padding: '14px 16px',
                  background: cat.depth === 0 ? 'var(--glass-bg)' : 'var(--bg-color-start)',
                  borderRadius: '10px',
                  border: `var(--border-width) solid ${cat.depth === 0 ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: cat.depth === 0 ? '15px' : '14px', fontWeight: cat.depth === 0 ? '600' : '400' }}>
                    {cat.depth > 0 ? '↳ ' : ''}{cat.name}
                  </span>
                  {cat.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '2px 0 0 0' }}>{cat.description}</p>
                  )}
                </div>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={cat.id} />
                  <button
                    type="submit"
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--text-error)',
                      background: 'rgba(220, 38, 38, 0.1)',
                      color: 'var(--text-error)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Delete
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
