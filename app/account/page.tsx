import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import AccountTabs from './AccountTabs';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  // Get user details
  const userQuery = {
    include: {
      orders: {
        orderBy: { createdAt: 'desc' as const },
        include: { items: { include: { productVariation: { include: { product: true } } } } }
      },
      wishlistItems: {
        orderBy: { createdAt: 'desc' as const },
        include: { product: true }
      },
      buyListSubmissions: {
        orderBy: { createdAt: 'desc' as const },
        include: { items: true }
      }
    }
  };

  let user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    ...userQuery
  });

  if (!user && session.user.role === 'ADMIN') {
    // Create the env admin in the database so they can use the account profile features
    user = await prisma.user.create({
      data: {
        email: session.user.email as string,
        name: session.user.name || 'Admin',
        passwordHash: 'ENV_ADMIN_FALLBACK',
        role: 'ADMIN',
      },
      ...userQuery
    });
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  async function updateProfile(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const zip = formData.get('zip') as string;
    
    if (!name) return;

    await prisma.user.update({
      where: { id: user?.id },
      data: { name, address, city, state, zip }
    });

    revalidatePath('/checkout');
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontSize: '28px' }}>Customer Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your profile, shipping information, and order history.</p>
        </div>
        {user.storeCredit > 0 && (
          <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', borderRadius: '12px', minWidth: '180px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Store Credit</span>
            <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#22c55e' }}>${user.storeCredit.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* Profile Details */}
        <div>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Profile & Shipping</h2>
            <ProfileForm user={user} />
          </div>
        </div>

        {/* Account Tabs */}
        <div>
          <AccountTabs orders={user.orders} wishlistItems={user.wishlistItems} buyListSubmissions={user.buyListSubmissions} />
        </div>

      </div>
    </div>
  );
}
